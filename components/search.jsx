import Image from "next/image";

export const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <Image src="/search.svg" alt="Search Icon" width={20} height={20} />
        <input
          id="search"
          type="text"
          placeholder="Search through movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
