import { t } from '@lingui/core/macro';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { v4 } from 'uuid';

import { sendParksAiChatRequest } from '@/parks-industrial/services/parks-ai.client';
import {
  type ParksAiAction,
  type ParksAiChatMessage,
  type ParksAiQuickAction,
  type ParksAiRouteContext,
} from '@/parks-industrial/types/parks-ai.types';
import { resolveParksAiScreenFromPath } from '@/parks-industrial/utils/parks-ai-route.util';

type ParksAiAssistantContextValue = {
  isOpen: boolean;
  isLoading: boolean;
  messages: ParksAiChatMessage[];
  suggestedFollowUps: string[];
  routeContext: ParksAiRouteContext;
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (message: string, action?: ParksAiAction) => Promise<void>;
  runQuickAction: (quickAction: ParksAiQuickAction) => Promise<void>;
  clearConversation: () => void;
  setContextPatch: (patch: Partial<ParksAiRouteContext>) => void;
};

const ParksAiAssistantContext =
  createContext<ParksAiAssistantContextValue | null>(null);

type ParksAiAssistantProviderProps = {
  children: ReactNode;
};

export const ParksAiAssistantProvider = ({
  children,
}: ParksAiAssistantProviderProps) => {
  const location = useLocation();
  const { contratoId, parqueId } = useParams<{
    contratoId?: string;
    parqueId?: string;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ParksAiChatMessage[]>([]);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [contextPatch, setContextPatchState] = useState<
    Partial<ParksAiRouteContext>
  >({});

  const baseRouteContext = useMemo<ParksAiRouteContext>(
    () => ({
      screen: resolveParksAiScreenFromPath(location.pathname),
      casoLegalId: contratoId,
      parqueId,
    }),
    [contratoId, location.pathname, parqueId],
  );

  const routeContext = useMemo(
    () => ({
      ...baseRouteContext,
      ...contextPatch,
    }),
    [baseRouteContext, contextPatch],
  );

  const setContextPatch = useCallback(
    (patch: Partial<ParksAiRouteContext>) => {
      setContextPatchState((currentPatch) => ({
        ...currentPatch,
        ...patch,
      }));
    },
    [],
  );

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSuggestedFollowUps([]);
  }, []);

  const sendMessage = useCallback(
    async (message: string, action?: ParksAiAction) => {
      const trimmedMessage = message.trim();

      if (trimmedMessage.length === 0 || isLoading) {
        return;
      }

      const userMessage: ParksAiChatMessage = {
        id: v4(),
        role: 'user',
        content: trimmedMessage,
      };

      const historyForRequest = [...messages, userMessage];

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setIsOpen(true);
      setIsLoading(true);

      try {
        const response = await sendParksAiChatRequest({
          message: trimmedMessage,
          action,
          context: routeContext,
          history: historyForRequest,
        });

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: v4(),
            role: 'assistant',
            content: response.reply,
          },
        ]);
        setSuggestedFollowUps(response.suggestedFollowUps ?? []);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t`Error desconocido`;

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: v4(),
            role: 'assistant',
            content: t`No pude conectar con el asistente Parks. Verifica que parks-twenty-service esté corriendo en el puerto 3002.\n\nDetalle: ${errorMessage}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, routeContext],
  );

  const runQuickAction = useCallback(
    async (quickAction: ParksAiQuickAction) => {
      await sendMessage(quickAction.message, quickAction.action);
    },
    [sendMessage],
  );

  const value = useMemo(
    () => ({
      isOpen,
      isLoading,
      messages,
      suggestedFollowUps,
      routeContext,
      openAssistant,
      closeAssistant,
      sendMessage,
      runQuickAction,
      clearConversation,
      setContextPatch,
    }),
    [
      clearConversation,
      closeAssistant,
      isLoading,
      isOpen,
      messages,
      openAssistant,
      routeContext,
      runQuickAction,
      sendMessage,
      setContextPatch,
      suggestedFollowUps,
    ],
  );

  return (
    <ParksAiAssistantContext.Provider value={value}>
      {children}
    </ParksAiAssistantContext.Provider>
  );
};

export const useParksAiAssistant = (): ParksAiAssistantContextValue => {
  const context = useContext(ParksAiAssistantContext);

  if (!context) {
    throw new Error(
      'useParksAiAssistant must be used within ParksAiAssistantProvider',
    );
  }

  return context;
};
