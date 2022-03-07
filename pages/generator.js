import React from "react";
import TransferList from "../src/Transferlist";

export default function generator() {
  const [selected, setSelected] = React.useState([1, 2, 3]);

  const handleSelected = (selection) => {
    console.log("fires");
    setSelected(selection);
  };

  return (
    <div>
      <TransferList handleSelected={handleSelected} />
      {selected.map((number, i) => {
        return <h2>{number}</h2>;
      })}
    </div>
  );
}
