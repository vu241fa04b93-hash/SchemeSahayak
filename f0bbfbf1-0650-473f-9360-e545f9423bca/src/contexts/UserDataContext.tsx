import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ApplicantProfile, ChatMessage, SchemeMatch } from '../types';
import { REQUIRED_PROFILE_FIELDS } from '../types';
import { profileService, schemeService } from '../services';
import { readJSON, userKey, writeJSON } from '../utils/storage';
import { useAuth } from './AuthContext';

interface UserDataValue {
  profile: ApplicantProfile;
  saveProfile: (patch: Partial<ApplicantProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  matches: SchemeMatch[];
  matching: boolean;
  matchError: boolean;
  refreshMatches: () => void;
  hasRequirement: boolean;
  completeness: number;
  savedSchemes: string[];
  toggleSaved: (schemeId: string) => void;
  chat: ChatMessage[];
  appendChat: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  checkedDocuments: string[];
  toggleDocument: (documentId: string) => void;
}

const UserDataContext = createContext<UserDataValue | null>(null);

export function UserDataProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [profile, setProfile] = useState<ApplicantProfile>({});
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState(false);
  const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [checkedDocuments, setCheckedDocuments] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);

  // Load everything for the signed-in user; wipe state on sign-out so the
  // next account never sees the previous one's data.
  useEffect(() => {
    if (!userId) {
      setProfile({});
      setMatches([]);
      setSavedSchemes([]);
      setChat([]);
      setCheckedDocuments([]);
      return;
    }
    let cancelled = false;
    profileService.load(userId).then((p) => {
      if (!cancelled) setProfile(p);
    });
    setSavedSchemes(readJSON<string[]>(userKey(userId, 'saved'), []));
    setChat(readJSON<ChatMessage[]>(userKey(userId, 'chat'), []));
    setCheckedDocuments(readJSON<string[]>(userKey(userId, 'documents'), []));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const hasRequirement = profile.project_cost !== undefined || profile.business_type !== undefined;

  // Matching is always recomputed from the live profile — change a number and
  // the whole downstream chain changes.
  useEffect(() => {
    if (!userId || !hasRequirement) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    setMatching(true);
    setMatchError(false);
    schemeService.
    match(profile).
    then((m) => {
      if (!cancelled) setMatches(m);
    }).
    catch(() => {
      if (!cancelled) setMatchError(true);
    }).
    finally(() => {
      if (!cancelled) setMatching(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, profile, hasRequirement, nonce]);

  const saveProfile = useCallback<UserDataValue['saveProfile']>(
    async (patch) => {
      if (!userId) return;
      const next = { ...profile, ...patch };
      const saved = await profileService.save(userId, next);
      setProfile(saved);
    },
    [profile, userId]
  );

  const resetProfile = useCallback(async () => {
    if (!userId) return;
    const saved = await profileService.save(userId, {});
    setProfile(saved);
  }, [userId]);

  const toggleSaved = useCallback(
    (schemeId: string) => {
      if (!userId) return;
      setSavedSchemes((prev) => {
        const next = prev.includes(schemeId) ?
        prev.filter((s) => s !== schemeId) :
        [...prev, schemeId];
        writeJSON(userKey(userId, 'saved'), next);
        return next;
      });
    },
    [userId]
  );

  const appendChat = useCallback(
    (messages: ChatMessage[]) => {
      if (!userId) return;
      setChat((prev) => {
        const next = [...prev, ...messages];
        writeJSON(userKey(userId, 'chat'), next);
        return next;
      });
    },
    [userId]
  );

  const clearChat = useCallback(() => {
    if (!userId) return;
    setChat([]);
    writeJSON(userKey(userId, 'chat'), []);
  }, [userId]);

  const toggleDocument = useCallback(
    (documentId: string) => {
      if (!userId) return;
      setCheckedDocuments((prev) => {
        const next = prev.includes(documentId) ?
        prev.filter((d) => d !== documentId) :
        [...prev, documentId];
        writeJSON(userKey(userId, 'documents'), next);
        return next;
      });
    },
    [userId]
  );

  const completeness = useMemo(() => {
    const answered = REQUIRED_PROFILE_FIELDS.filter((f) => {
      const v = profile[f];
      return v !== undefined && v !== null && v !== '';
    }).length;
    return Math.round(answered / REQUIRED_PROFILE_FIELDS.length * 100);
  }, [profile]);

  const value = useMemo<UserDataValue>(
    () => ({
      profile,
      saveProfile,
      resetProfile,
      matches,
      matching,
      matchError,
      refreshMatches: () => setNonce((n) => n + 1),
      hasRequirement,
      completeness,
      savedSchemes,
      toggleSaved,
      chat,
      appendChat,
      clearChat,
      checkedDocuments,
      toggleDocument
    }),
    [
    profile,
    saveProfile,
    resetProfile,
    matches,
    matching,
    matchError,
    hasRequirement,
    completeness,
    savedSchemes,
    toggleSaved,
    chat,
    appendChat,
    clearChat,
    checkedDocuments,
    toggleDocument]

  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used inside UserDataProvider');
  return ctx;
}