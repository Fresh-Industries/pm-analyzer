// Feedback Widget - Reusable component for any app

'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown, ThumbsDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackWidgetProps {
  projectId: string;
  position?: 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
  onSubmit?: (feedback: any) => void;
}

export function FeedbackWidget({
  projectId,
  position = 'bottom-right',
  showLabel = true,
  onSubmit,
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!sentiment && !comment.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/agents/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: [
            {
              text: comment || `Sentiment: ${sentiment}`,
              source: 'in-app-widget',
            },
          ],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
        onSubmit?.(data.output);
      }
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-6 z-50`}
      >
        <Card className="w-80 shadow-lg border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <ThumbsUp className="w-8 h-8 text-green-600 mx-auto" />
            </div>
            <p className="font-medium text-green-900">Thanks for your feedback!</p>
            <p className="text-sm text-green-700 mt-1">We appreciate you taking the time.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setIsSubmitted(false);
                setSentiment(null);
                setComment('');
                setIsOpen(false);
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-6 z-50`}
      >
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-purple-600 hover:bg-purple-700"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="rounded-full w-10 h-10 shadow-lg bg-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Feedback Form */}
      {isOpen && (
        <div
          className={`fixed ${position === 'bottom-right' ? 'right-6' : 'left-6'} bottom-24 z-50`}
        >
          <Card className="w-80 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Send Feedback
              </CardTitle>
              {showLabel && (
                <p className="text-xs text-muted-foreground">
                  Help us improve! Your feedback goes directly to our AI agent.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sentiment Selection */}
              <div className="flex gap-2">
                <Button
                  variant={sentiment === 'positive' ? 'default' : 'outline'}
                  className={`flex-1 ${sentiment === 'positive' ? 'bg-green-600' : ''}`}
                  onClick={() => setSentiment('positive')}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Good
                </Button>
                <Button
                  variant={sentiment === 'negative' ? 'destructive' : 'outline'}
                  className={`flex-1 ${sentiment === 'negative' ? 'bg-red-600' : ''}`}
                  onClick={() => setSentiment('negative')}
                >
                  <ThumbsDownIcon className="w-4 h-4 mr-1" />
                  Needs Work
                </Button>
              </div>

              {/* Comment */}
              <Textarea
                placeholder="Tell us more (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!sentiment && !comment.trim())}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default FeedbackWidget;
