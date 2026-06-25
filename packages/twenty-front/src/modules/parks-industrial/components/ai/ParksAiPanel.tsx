import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconSparkles, IconX } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { type ParksAiScreen } from '@/parks-industrial/types/parks-ai.types';
import {
  buildParksApprovalQuickActions,
  buildParksDashboardQuickActions,
  buildParksMapQuickActions,
} from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { getParksAiScreenLabel } from '@/parks-industrial/utils/parks-ai-route.util';

const StyledOverlay = styled.div`
  animation: parks-ai-overlay-enter 0.2s ease;
  backdrop-filter: blur(2px);
  background: rgba(15, 23, 42, 0.42);
  inset: 0;
  position: fixed;
  z-index: 60;

  @keyframes parks-ai-overlay-enter {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const StyledPanel = styled.aside`
  animation: parks-ai-panel-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  bottom: 0;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  position: fixed;
  right: 0;
  top: 0;
  width: min(440px, 100vw);
  z-index: 61;

  @keyframes parks-ai-panel-enter {
    from {
      opacity: 0;
      transform: translateX(24px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green1} 0%,
    ${themeCssVariables.background.primary} 55%
  );
  border-bottom: 1px solid ${themeCssVariables.color.green3};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledHeaderIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHeaderIcon = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green7},
    ${themeCssVariables.color.green5}
  );
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: 0 0 12px ${themeCssVariables.color.green3};
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 2px 0 0;
`;

const StyledContextBadge = styled.span`
  background: ${themeCssVariables.color.green2};
  border: 1px solid ${themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.color.green8};
  display: inline-block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 2px 8px;
`;

const StyledMessages = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMessageRow = styled.div<{ isUser: boolean }>`
  align-items: flex-end;
  display: flex;
  flex-direction: ${({ isUser }) => (isUser ? 'row-reverse' : 'row')};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green7},
    ${themeCssVariables.color.green5}
  );
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledMessageBubble = styled.div<{ isUser: boolean }>`
  background: ${({ isUser }) =>
    isUser
      ? `linear-gradient(135deg, ${themeCssVariables.color.green2}, ${themeCssVariables.color.green1})`
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isUser }) =>
      isUser
        ? themeCssVariables.color.green3
        : themeCssVariables.border.color.medium};
  border-radius: ${({ isUser }) =>
    isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
  box-shadow: ${({ isUser }) =>
    isUser ? 'none' : themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  max-width: calc(100% - 40px);
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledAssistantContent = styled.div`
  p {
    line-height: 1.5;
    margin: 0 0 ${themeCssVariables.spacing[2]};

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    margin: 0 0 ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[4]};
  }

  li {
    margin-bottom: ${themeCssVariables.spacing[1]};
  }

  strong {
    color: ${themeCssVariables.color.green8};
    font-weight: ${themeCssVariables.font.weight.semiBold};
  }

  code {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    font-size: 0.9em;
    padding: 1px 4px;
  }
`;

const StyledLoadingBubble = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 14px 14px 14px 4px;
  display: flex;
  gap: 6px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledLoadingDot = styled.span<{ delay: number }>`
  animation: parks-ai-dot-bounce 1.2s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
  background: ${themeCssVariables.color.green};
  border-radius: 50%;
  height: 7px;
  width: 7px;

  @keyframes parks-ai-dot-bounce {
    0%,
    80%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }

    40% {
      opacity: 1;
      transform: translateY(-4px);
    }
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: auto 0;
`;

const StyledEmptyIntro = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.55;
  text-align: center;
`;

const StyledEmptyTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-align: center;
`;

const StyledSuggestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSuggestionCard = styled.button`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.color.green};
    box-shadow: 0 0 0 1px ${themeCssVariables.color.green3};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StyledSuggestionLabel = styled.span`
  color: ${themeCssVariables.color.green8};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: 4px;
`;

const StyledFollowUpsSection = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]} 0;
`;

const StyledFollowUpsLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFollowUps = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFollowUpChip = styled.button`
  background: ${themeCssVariables.color.green1};
  border: 1px solid ${themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.color.green8};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 5px 10px;
  transition: background 0.15s ease;

  &:hover {
    background: ${themeCssVariables.color.green2};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StyledComposer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  min-height: 80px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  resize: vertical;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;

  &:focus {
    border-color: ${themeCssVariables.color.green};
    box-shadow: 0 0 0 3px ${themeCssVariables.color.green2};
    outline: none;
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledComposerActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const getScreenSuggestions = (screen: ParksAiScreen) => {
  switch (screen) {
    case 'approval':
      return buildParksApprovalQuickActions();
    case 'map':
      return buildParksMapQuickActions();
    case 'dashboard':
      return buildParksDashboardQuickActions();
    default:
      return [
        {
          id: 'general-help',
          label: t`Consulta general`,
          message: t`¿Qué puedes ayudarme a revisar en Parks Industrial?`,
          action: 'general' as const,
        },
      ];
  }
};

export const ParksAiPanel = () => {
  const {
    isOpen,
    isLoading,
    messages,
    suggestedFollowUps,
    routeContext,
    closeAssistant,
    sendMessage,
    runQuickAction,
    clearConversation,
  } = useParksAiAssistant();
  const [draftMessage, setDraftMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const screenSuggestions = useMemo(
    () => getScreenSuggestions(routeContext.screen),
    [routeContext.screen],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) {
    return null;
  }

  const handleSend = async () => {
    const message = draftMessage.trim();

    if (message.length === 0) {
      return;
    }

    setDraftMessage('');
    await sendMessage(message);
  };

  return (
    <>
      <StyledOverlay onClick={closeAssistant} />
      <StyledPanel>
        <StyledHeader>
          <StyledHeaderIdentity>
            <StyledHeaderIcon>
              <IconSparkles size={18} />
            </StyledHeaderIcon>
            <div>
              <StyledTitle>{t`Asistente Parks`}</StyledTitle>
              <StyledSubtitle>{t`Inteligencia sobre cartera, legal y disponibilidad`}</StyledSubtitle>
              <StyledContextBadge>
                {getParksAiScreenLabel(routeContext.screen)}
              </StyledContextBadge>
            </div>
          </StyledHeaderIdentity>
          <LightIconButton
            Icon={IconX}
            accent="tertiary"
            title={t`Cerrar`}
            aria-label={t`Cerrar`}
            onClick={closeAssistant}
          />
        </StyledHeader>

        <StyledMessages>
          {messages.length === 0 ? (
            <StyledEmptyState>
              <StyledEmptyTitle>{t`¿En qué te ayudo?`}</StyledEmptyTitle>
              <StyledEmptyIntro>
                {t`Revisa checklist legal, resume casos o busca naves disponibles según el contexto de esta pantalla.`}
              </StyledEmptyIntro>
              <StyledSuggestionList>
                {screenSuggestions.map((suggestion) => (
                  <StyledSuggestionCard
                    key={suggestion.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => void runQuickAction(suggestion)}
                  >
                    <StyledSuggestionLabel>{suggestion.label}</StyledSuggestionLabel>
                    {suggestion.message}
                  </StyledSuggestionCard>
                ))}
              </StyledSuggestionList>
            </StyledEmptyState>
          ) : (
            messages.map((message) => (
              <StyledMessageRow
                key={message.id}
                isUser={message.role === 'user'}
              >
                {message.role === 'assistant' ? (
                  <StyledAvatar>
                    <IconSparkles size={14} />
                  </StyledAvatar>
                ) : null}
                <StyledMessageBubble isUser={message.role === 'user'}>
                  {message.role === 'assistant' ? (
                    <StyledAssistantContent>
                      <LazyMarkdownRenderer text={message.content} />
                    </StyledAssistantContent>
                  ) : (
                    message.content
                  )}
                </StyledMessageBubble>
              </StyledMessageRow>
            ))
          )}
          {isLoading ? (
            <StyledMessageRow isUser={false}>
              <StyledAvatar>
                <IconSparkles size={14} />
              </StyledAvatar>
              <StyledLoadingBubble>
                <StyledLoadingDot delay={0} />
                <StyledLoadingDot delay={0.15} />
                <StyledLoadingDot delay={0.3} />
              </StyledLoadingBubble>
            </StyledMessageRow>
          ) : null}
          <div ref={messagesEndRef} />
        </StyledMessages>

        {suggestedFollowUps.length > 0 ? (
          <StyledFollowUpsSection>
            <StyledFollowUpsLabel>{t`Sugerencias`}</StyledFollowUpsLabel>
            <StyledFollowUps>
              {suggestedFollowUps.map((followUp) => (
                <StyledFollowUpChip
                  key={followUp}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void sendMessage(followUp)}
                >
                  {followUp}
                </StyledFollowUpChip>
              ))}
            </StyledFollowUps>
          </StyledFollowUpsSection>
        ) : null}

        <StyledComposer>
          <StyledTextarea
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder={t`Escribe tu pregunta sobre Parks...`}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          <StyledComposerActions>
            <Button
              title={t`Limpiar`}
              variant="secondary"
              onClick={clearConversation}
              disabled={isLoading || messages.length === 0}
            />
            <Button
              title={t`Enviar`}
              accent="blue"
              onClick={() => void handleSend()}
              disabled={isLoading || draftMessage.trim().length === 0}
            />
          </StyledComposerActions>
        </StyledComposer>
      </StyledPanel>
    </>
  );
};
