/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

const botProtectionSchema = z.object({
  TurnstileCheckEnabled: z.boolean(),
  TurnstileSiteKey: z.string(),
  TurnstileSecretKey: z.string(),
  RecaptchaCheckEnabled: z.boolean(),
  RecaptchaSiteKey: z.string(),
  RecaptchaSecretKey: z.string(),
  GeetestCheckEnabled: z.boolean(),
  GeetestId: z.string(),
  GeetestKey: z.string(),
})

type BotProtectionFormValues = z.infer<typeof botProtectionSchema>

type BotProtectionSectionProps = {
  defaultValues: BotProtectionFormValues
}

const tabContentClassName =
  'grid min-w-0 gap-x-5 gap-y-6 lg:grid-cols-2 [&>[data-slot=form-item]]:min-w-0 lg:[&>[data-slot=form-item]:has([data-slot=switch])]:col-span-2'

const buildFormDefaults = (
  defaults: BotProtectionFormValues
): BotProtectionFormValues => ({
  TurnstileCheckEnabled: defaults.TurnstileCheckEnabled,
  TurnstileSiteKey: defaults.TurnstileSiteKey ?? '',
  TurnstileSecretKey: defaults.TurnstileSecretKey ?? '',
  RecaptchaCheckEnabled: defaults.RecaptchaCheckEnabled,
  RecaptchaSiteKey: defaults.RecaptchaSiteKey ?? '',
  RecaptchaSecretKey: defaults.RecaptchaSecretKey ?? '',
  GeetestCheckEnabled: defaults.GeetestCheckEnabled,
  GeetestId: defaults.GeetestId ?? '',
  GeetestKey: defaults.GeetestKey ?? '',
})

export function BotProtectionSection({
  defaultValues,
}: BotProtectionSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const [activeTab, setActiveTab] = useState('turnstile')

  const formDefaults = useMemo(
    () => buildFormDefaults(defaultValues),
    [defaultValues]
  )

  const form = useForm<BotProtectionFormValues>({
    resolver: zodResolver(botProtectionSchema),
    defaultValues: formDefaults,
  })

  const baselineRef = useRef<BotProtectionFormValues>(formDefaults)
  const baselineSerializedRef = useRef<string>(JSON.stringify(formDefaults))

  useEffect(() => {
    const next = buildFormDefaults(defaultValues)
    const serialized = JSON.stringify(next)
    if (serialized === baselineSerializedRef.current) return
    baselineRef.current = next
    baselineSerializedRef.current = serialized
    form.reset(next)
  }, [defaultValues, form])

  const onSubmit = async (values: BotProtectionFormValues) => {
    // Only one captcha provider can be active on the backend at a time.
    const enabledCount = [
      values.TurnstileCheckEnabled,
      values.RecaptchaCheckEnabled,
      values.GeetestCheckEnabled,
    ].filter(Boolean).length
    if (enabledCount > 1) {
      toast.error(t('Only one captcha provider can be enabled at a time'))
      return
    }

    const changedKeys = (
      Object.keys(values) as Array<keyof BotProtectionFormValues>
    ).filter((key) => values[key] !== baselineRef.current[key])

    if (changedKeys.length === 0) {
      toast.info(t('No changes to save'))
      return
    }

    for (const key of changedKeys) {
      const value = values[key]
      await updateOption.mutateAsync({
        key,
        value: typeof value === 'boolean' ? String(value) : value,
      })
    }

    baselineRef.current = values
    baselineSerializedRef.current = JSON.stringify(values)
    form.reset(values)
  }

  const handleReset = () => {
    form.reset(baselineRef.current)
    toast.success(t('Form reset to saved values'))
  }

  return (
    <>
      <FormNavigationGuard when={form.formState.isDirty} />

      <SettingsSection title={t('Bot Protection')}>
        <Form {...form}>
          <SettingsForm
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete='off'
          >
            <SettingsPageFormActions
              onSave={form.handleSubmit(onSubmit)}
              onReset={handleReset}
              isSaving={updateOption.isPending}
              isResetDisabled={!form.formState.isDirty}
            />
            <FormDirtyIndicator isDirty={form.formState.isDirty} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='turnstile'>
                  {t('Cloudflare Turnstile')}
                </TabsTrigger>
                <TabsTrigger value='recaptcha'>
                  {t('Google reCAPTCHA')}
                </TabsTrigger>
                <TabsTrigger value='geetest'>{t('GeeTest')}</TabsTrigger>
              </TabsList>

              <TabsContent value='turnstile' className={tabContentClassName}>
                <FormField
                  control={form.control}
                  name='TurnstileCheckEnabled'
                  render={({ field }) => (
                    <SettingsSwitchItem>
                      <SettingsSwitchContent>
                        <FormLabel>{t('Enable Turnstile')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Protect login and registration with Cloudflare Turnstile'
                          )}
                        </FormDescription>
                      </SettingsSwitchContent>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('RecaptchaCheckEnabled', false, {
                                shouldDirty: true,
                              })
                              form.setValue('GeetestCheckEnabled', false, {
                                shouldDirty: true,
                              })
                            }
                          }}
                        />
                      </FormControl>
                    </SettingsSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='TurnstileSiteKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Site Key')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('Your Turnstile site key')}
                          autoComplete='off'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='TurnstileSecretKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Secret Key')}</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={t('Your Turnstile secret key')}
                          autoComplete='new-password'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value='recaptcha' className={tabContentClassName}>
                <FormField
                  control={form.control}
                  name='RecaptchaCheckEnabled'
                  render={({ field }) => (
                    <SettingsSwitchItem>
                      <SettingsSwitchContent>
                        <FormLabel>{t('Enable reCAPTCHA')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Protect login and registration with Google reCAPTCHA v2'
                          )}
                        </FormDescription>
                      </SettingsSwitchContent>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('TurnstileCheckEnabled', false, {
                                shouldDirty: true,
                              })
                              form.setValue('GeetestCheckEnabled', false, {
                                shouldDirty: true,
                              })
                            }
                          }}
                        />
                      </FormControl>
                    </SettingsSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='RecaptchaSiteKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Site Key')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('Your reCAPTCHA site key')}
                          autoComplete='off'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='RecaptchaSecretKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Secret Key')}</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={t('Your reCAPTCHA secret key')}
                          autoComplete='new-password'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value='geetest' className={tabContentClassName}>
                <FormField
                  control={form.control}
                  name='GeetestCheckEnabled'
                  render={({ field }) => (
                    <SettingsSwitchItem>
                      <SettingsSwitchContent>
                        <FormLabel>{t('Enable GeeTest')}</FormLabel>
                        <FormDescription>
                          {t(
                            'Protect login and registration with GeeTest behavior verification'
                          )}
                        </FormDescription>
                      </SettingsSwitchContent>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('TurnstileCheckEnabled', false, {
                                shouldDirty: true,
                              })
                              form.setValue('RecaptchaCheckEnabled', false, {
                                shouldDirty: true,
                              })
                            }
                          }}
                        />
                      </FormControl>
                    </SettingsSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='GeetestId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('GeeTest ID')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('Your GeeTest ID')}
                          autoComplete='off'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='GeetestKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('GeeTest Key')}</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={t('Your GeeTest key')}
                          autoComplete='new-password'
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
