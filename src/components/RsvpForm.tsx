"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitRsvp, type RsvpState } from "@/app/actions/rsvp";
import { useI18n } from "@/i18n/I18nProvider";
import { RSVP_STATUSES, type Invitation } from "@/types/invitation";

type RsvpFormProps = {
  invitation: Invitation;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

const DEFAULT_INPUT =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-start outline-none transition focus:border-ink";

export function RsvpForm({
  invitation,
  className = "",
  inputClassName = DEFAULT_INPUT,
  buttonClassName = "w-full rounded-full bg-ink px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60",
}: RsvpFormProps) {
  const { m } = useI18n();
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(
    submitRsvp,
    null,
  );

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {state?.ok ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white/80 p-8 text-center shadow-sm"
          >
            <div className="text-4xl" aria-hidden>
              💛
            </div>
            <h3 className="mt-3 text-2xl font-semibold">
              {m.rsvp.thankYouTitle}
            </h3>
            <p className="mt-2 opacity-80">{m.rsvp.thankYouMessage}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <input type="hidden" name="invitationId" value={invitation.id} />

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="guestName">
                {m.rsvp.name}
              </label>
              <input
                id="guestName"
                name="guestName"
                required
                maxLength={120}
                placeholder={m.rsvp.namePlaceholder}
                className={inputClassName}
              />
            </div>

            <fieldset>
              <legend className="mb-1 block text-sm font-medium">
                {m.rsvp.status}
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {RSVP_STATUSES.map((status, idx) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 has-[:checked]:border-ink has-[:checked]:bg-ink/5"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      defaultChecked={idx === 0}
                      className="accent-ink"
                    />
                    <span className="text-sm">{m.rsvp[status]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="guestsCount"
              >
                {m.rsvp.guestsCount}
              </label>
              <input
                id="guestsCount"
                name="guestsCount"
                type="number"
                min={1}
                max={50}
                defaultValue={1}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="message">
                {m.rsvp.message}
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                maxLength={1000}
                placeholder={m.rsvp.messagePlaceholder}
                className={inputClassName}
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600">
                {state.error === "validation"
                  ? m.rsvp.required
                  : m.rsvp.errorGeneric}
              </p>
            )}

            <button type="submit" disabled={pending} className={buttonClassName}>
              {pending ? m.rsvp.submitting : m.rsvp.submit}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
