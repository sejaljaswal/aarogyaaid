import { create } from 'zustand';

const useStore = create((set) => ({
  userProfile: {
    age: 30,
    city_tier: 1,
    annual_income: 1200000,
    pre_existing_conditions: [],
    lifestyle: {
      smoker: false,
      habitual_drinker: false,
      regular_exercise: true,
    },
    has_existing_insurance: false,
  },
  recommendations: [],
  isLoading: false,
  step: 1,

  setProfile: (data) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...data },
    })),

  setLifestyle: (data) =>
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        lifestyle: { ...state.userProfile.lifestyle, ...data },
      },
    })),

  setStep: (step) => set({ step }),

  fetchRecommendations: async () => {
    set({ isLoading: true });
    try {
      const profile = useStore.getState().userProfile;
      // Note: In a real app, use an environment variable for the API URL
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      set({ recommendations: data, isLoading: false, step: 4 });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      set({ isLoading: false });
    }
  },
}));

export default useStore;
