const matchesReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD':
      return action.payload.map((match) => ({ ...match }));
    case 'ADD': {
      const nextId = state.reduce((maxId, match) => Math.max(maxId, match.id), 0) + 1;
      return [...state, { ...action.payload, id: nextId }];
    }
    case 'REMOVE':
      return state.filter((match) => match.id !== action.payload);
    case 'SET_GOALS':
      return state.map((match) => {
        if (match.id !== action.payload.id) return match;
        return { ...match, [action.payload.field]: action.payload.goals };
      });
    case 'RESTORE':
      return [...state, { ...action.payload }].sort((a, b) => a.id - b.id);
    default:
      return state;
  }
};

export default matchesReducer;
