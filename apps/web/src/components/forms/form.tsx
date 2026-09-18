import type { ReactNode } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import type { DefaultValues, FieldValues, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodType } from "zod"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface FormProps<TFormValues extends FieldValues> {
  children: ReactNode
  onSubmit: SubmitHandler<TFormValues>
  schema?: ZodType
  defaultValues?: DefaultValues<TFormValues>
  className?: string
}

/**
 * `<Form>` — react-hook-form provider + optional zod resolver + submit wrapper.
 * Fields rendered inside inherit the form context via react-hook-form.
 */
export function Form<TFormValues extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  className,
}: FormProps<TFormValues>) {
  const form = useForm<TFormValues>({
    // zod v4's ZodType output type doesn't line up with the resolver's generic;
    // the schema is validated at runtime by react-hook-form regardless.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
    defaultValues,
  })

  return (
    <FormProvider {...form}>
      <form
        className={cn("grid gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  )
}

/** Expose the react-hook-form context to field controls. */
export function useFormField() {
  return useFormContext()
}

/**
 * Layout shell: label + description + error wired to a field's error state.
 * Composes the existing `components/ui/field.tsx` primitives — no re-styling.
 */
export function FormItem({
  name,
  label,
  description,
  error,
  children,
  className,
}: {
  name: string
  label?: string
  description?: string
  error?: { message?: string } | null
  children: ReactNode
  className?: string
}) {
  return (
    <Field className={cn("gap-1.5", className)}>
      {label ? <FieldLabel htmlFor={name}>{label}</FieldLabel> : null}
      {children}
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
      <FieldError errors={[error ?? undefined]} />
    </Field>
  )
}