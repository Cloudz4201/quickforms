import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  forms: [
    {
      id: 1,
      title: 'Customer Feedback',
      createdAt: '2024-02-16T10:00:00',
      fields: [
        {
          id: '1',
          type: 'short_text',
          question: 'What do you think about our service?',
          required: true,
        },
        {
          id: '2',
          type: 'radio',
          question: 'Would you recommend us to others?',
          required: true,
          options: ['Yes', 'No', 'Maybe'],
        },
      ],
      responses: 45,
    },
    {
      id: 2,
      title: 'Event Registration',
      createdAt: '2024-02-16T11:00:00',
      fields: [
        {
          id: '1',
          type: 'short_text',
          question: 'Your Name',
          required: true,
        },
        {
          id: '2',
          type: 'email',
          question: 'Email Address',
          required: true,
        },
        {
          id: '3',
          type: 'checkbox',
          question: 'Which sessions would you like to attend?',
          required: true,
          options: ['Morning Session', 'Afternoon Session', 'Evening Session'],
        },
      ],
      responses: 128,
    },
  ],
  activeForm: null,
  status: 'idle',
  error: null,
};

export const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setActiveForm: (state, action) => {
      state.activeForm = action.payload;
    },
    addForm: (state, action) => {
      state.forms.push(action.payload);
    },
    updateForm: (state, action) => {
      const index = state.forms.findIndex(form => form.id === action.payload.id);
      if (index !== -1) {
        state.forms[index] = action.payload;
      }
    },
    deleteForm: (state, action) => {
      state.forms = state.forms.filter(form => form.id !== action.payload);
    },
    addResponse: (state, action) => {
      const { formId } = action.payload;
      const form = state.forms.find(f => f.id === formId);
      if (form) {
        form.responses += 1;
      }
    },
  },
});

export const { setActiveForm, addForm, updateForm, deleteForm, addResponse } = formsSlice.actions;

export const selectForms = (state) => state.forms.forms;
export const selectActiveForm = (state) => state.forms.activeForm;

export default formsSlice.reducer; 