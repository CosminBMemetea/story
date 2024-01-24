// AnonymousUserIdContext.tsx
import React from 'react';

// Define the context type
type AnonymousUserIdContextType = string | null;

// Create the context with the defined type
const AnonymousUserIdContext = React.createContext<AnonymousUserIdContextType>(null);

export default AnonymousUserIdContext;
