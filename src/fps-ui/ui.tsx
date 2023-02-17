import React from "react";
import { World } from "../fps-test";
import { WorldContext, useQuery } from "./world-context";
import { TestQuery } from "./test-query";

export function Ui() {
  return (
    <WorldContext.Provider value={World}>
      <TestQuery />
    </WorldContext.Provider>
  );
}
