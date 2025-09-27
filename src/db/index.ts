import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return {
      select: () => ({
        from: () => [],
      }),
    };
  }

  // for query purposes with connection pooling
  const queryClient = postgres(process.env.DATABASE_URL, {
    max: 100, // Maximum number of connections in pool
  });
  const db = drizzle(queryClient);
  return db;
};

export default setup();
