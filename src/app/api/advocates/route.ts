import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { asc, count, sql, or, ilike } from "drizzle-orm";
import { validateJWT, createAuthErrorResponse } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    // Validate JWT token
    const { valid } = await validateJWT(request);
    if (!valid) {
      return createAuthErrorResponse();
    }

    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Parse search parameter
    const search = searchParams.get('search')?.trim() || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return Response.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Validate search query
    if (search && (search.length > 100)) {
      return Response.json(
        { error: 'Search query must be larger than 100 characters' },
        { status: 400 }
      );
    }

    // Block searches with only special characters
    if (search && /^[^a-zA-Z0-9\s]+$/.test(search)) {
      return Response.json(
        { error: 'Search query must contain alphanumeric characters' },
        { status: 400 }
      );
    }

    // Build search condition if search term provided - searches all text columns except specialties
    const searchCondition = search ? or(
      ilike(advocates.firstName, `%${search}%`),
      ilike(advocates.lastName, `%${search}%`),
      ilike(advocates.city, `%${search}%`),
      ilike(advocates.degree, `%${search}%`),
      // Cast numeric columns to text for ILIKE search using parameterized queries
      sql`${advocates.yearsOfExperience}::text ILIKE ${'%' + search + '%'}`,
      sql`${advocates.phoneNumber}::text ILIKE ${'%' + search + '%'}`
    ) : undefined;

    // Get total count for pagination metadata
    const [totalResult] = await db
      .select({ count: count() })
      .from(advocates)
      .where(searchCondition);
    const total = totalResult.count;

    // Get advocates with search, ordering and pagination
    const data = await db
      .select()
      .from(advocates)
      .where(searchCondition)
      .orderBy(asc(advocates.id))
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Error fetching advocates:', error);

    // Return 500 Internal Server Error for any unexpected issues
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
