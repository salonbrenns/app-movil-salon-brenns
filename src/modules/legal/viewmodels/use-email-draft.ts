import * as Linking from 'expo-linking';
import { useState } from 'react';
import { emailDraftUri } from '../services/email-draft';

export function useEmailDraft() {
  const [error, setError] = useState(false);
  const [opened, setOpened] = useState(false);
  return {
    error,
    opened,
    open: async (subject: string, body: string) => {
      setError(false);
      setOpened(false);
      try {
        await Linking.openURL(emailDraftUri(subject, body));
        setOpened(true);
      } catch {
        setError(true);
      }
    },
  };
}
