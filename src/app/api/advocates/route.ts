import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { asc, count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return Response.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get total count for pagination metadata
    const [totalResult] = await db.select({ count: count() }).from(advocates);
    const total = totalResult.count;

    // Get advocates with ordering and pagination
    const data = await db
      .select()
      .from(advocates)
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
