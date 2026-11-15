"use client";
import React from "react";
import type { VisitedCountry } from "./countries";

/**
 * Countries detected from the user's photos. Lives only in memory: nothing is
 * persisted or sent to a server, so a refresh clears it.
 */
export const VisitedCountriesContext = React.createContext<VisitedCountry[]>(
  []
);
