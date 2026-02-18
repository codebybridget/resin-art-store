import React, { useContext, useMemo } from "react";
import "./ItemDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FullItem from "../FullItem/FullItem";

const ItemDisplay = ({ category }) => {
  const { item_list = [], loading, error, searchText } = useContext(StoreContext);

  if (loading) return <div style={{ padding: "20px" }}>Loading items...</div>;
  if (error) return <div style={{ padding: "20px" }}>Error: {error}</div>;
  if (!item_list.length) return <div style={{ padding: "20px" }}>No items available yet.</div>;

  const normalize = (str) => String(str || "").trim().toLowerCase();
  const selectedCategory = normalize(category || "all");
  const search = normalize(searchText);

  const itemsToDisplay = useMemo(() => {
    return item_list.filter((item) => {
      if (!item) return false;

      const itemCategory = normalize(item.category);
      const matchesCategory =
        selectedCategory === "all" || itemCategory === selectedCategory;

      if (!matchesCategory) return false;

      if (!search) return true;

      const name = normalize(item.name);
      const desc = normalize(item.description);
      const cat = normalize(item.category);

      return (
        name.includes(search) ||
        desc.includes(search) ||
        cat.includes(search)
      );
    });
  }, [item_list, selectedCategory, search]);

  if (!itemsToDisplay.length) {
    return (
      <div className="item-display">
        <h2>Top items for you</h2>

        <div className="no-items-box">
          <h3>No results found</h3>
          <p>
            We couldn’t find anything for <b>"{searchText}"</b>.  
            Try searching another name.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="item-display">
      <h2>{search ? `Search results for "${searchText}"` : "Top items for you"}</h2>

      <div className="item-display-list">
        {itemsToDisplay.map((item) => (
          <FullItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            category={item.category}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemDisplay;
