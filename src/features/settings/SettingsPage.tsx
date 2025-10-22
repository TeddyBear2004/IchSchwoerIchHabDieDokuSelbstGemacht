/**
 * Settings Page - UI für die Einstellungen
 */

import { useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AISettings } from './types';

export function SettingsPage() {
  const { settings, updateSettings, isLoading, error } = useSettings();
  const [formData, setFormData] = useState<AISettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.currentTarget;
    const actualValue = type === 'number' ? parseFloat(value) : value;

    if (name.startsWith('prompt.')) {
      const path = name.split('.');
      setFormData((prev) => ({
        ...prev,
        prompts: {
          ...prev.prompts,
          [path[1]]: {
            ...prev.prompts[path[1] as keyof typeof prev.prompts],
            [path[2]]: actualValue,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: actualValue,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSuccessMessage('');
      await updateSettings(formData);
      setSuccessMessage('Einstellungen erfolgreich gespeichert!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Einstellungen werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Einstellungen</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Fehler</p>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* API Einstellungen */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API-Einstellungen</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <Input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="Geben Sie Ihren API Key ein"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
              <Input
                type="text"
                name="apiBaseUrl"
                value={formData.apiBaseUrl}
                onChange={handleInputChange}
                placeholder="z.B. https://api.groq.com"
              />
              <p className="text-xs text-gray-500 mt-1">Basis-URL des API-Servers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modell</label>
              <Input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="z.B. openai/gpt-oss-20b"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperatur</label>
                <Input
                  type="number"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <Input
                  type="number"
                  name="maxTokens"
                  min="1"
                  value={formData.maxTokens}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Prompts */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prompts</h2>

          {/* Begründung */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Begründung</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mit Stichpunkten
                </label>
                <Textarea
                  name="prompt.begruendung.mitStichpunkten"
                  value={formData.prompts.begruendung.mitStichpunkten}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ohne Stichpunkte
                </label>
                <Textarea
                  name="prompt.begruendung.ohneStichpunkte"
                  value={formData.prompts.begruendung.ohneStichpunkte}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <Textarea
                  name="prompt.begruendung.systemPrompt"
                  value={formData.prompts.begruendung.systemPrompt}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Bewertung */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Bewertung</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mit Stichpunkten
                </label>
                <Textarea
                  name="prompt.bewertung.mitStichpunkten"
                  value={formData.prompts.bewertung.mitStichpunkten}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ohne Stichpunkte
                </label>
                <Textarea
                  name="prompt.bewertung.ohneStichpunkte"
                  value={formData.prompts.bewertung.ohneStichpunkte}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <Textarea
                  name="prompt.bewertung.systemPrompt"
                  value={formData.prompts.bewertung.systemPrompt}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || isLoading}
          >
            Zurücksetzen
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}

