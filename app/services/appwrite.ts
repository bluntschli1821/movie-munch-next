import { Client, Databases, ID, Query } from "appwrite";

// Appwrite service layer for Movie Munch.
// This file is responsible for tracking which search terms users are looking for and for calculating the top trending movies.
// The database keeps a record of each search term, the movie linked to it, and how many times it has been searched.

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const database = new Databases(client);

// updateSearchCount handles the search-tracking workflow.
// It checks whether a search term already exists, increments the count if it does,
// or creates a new record if it is the first time that term has been searched.
// This powers the "Trending Movies" feature shown on the homepage.
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);
    // check if a record of search exists in the local storage
    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];

      // update the movie count
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        { count: existingMovie.count + 1 }
      );
    } else {
      // create a new record for the search term with the movie data
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/no-movie.png",
      });
    }
    // console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
  // if a record exists, update the record with the new movie data
  // if a record does not exist, create a new record with the movie data
};

// getTrendigMovies fetches the highest-count search terms from Appwrite.
// It returns the top 5 results ranked by search popularity, which is then displayed in the trending section.
export const getTrendigMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
