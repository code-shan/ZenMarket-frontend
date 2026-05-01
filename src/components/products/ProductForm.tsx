"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const listingSchema = z.object({
  title: z.string().min(2, "Add a title."),
  description: z.string().min(10, "Add a short description."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount."),
})

export type ListingFormValues = z.infer<typeof listingSchema>

export function ProductForm({
  onSubmitAction,
}: {
  onSubmitAction?: (values: ListingFormValues) => void | Promise<void>
}) {
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
    },
  })

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmitAction?.(values)
          })}
        >
          <CardHeader>
            <CardTitle>List an item</CardTitle>
            <CardDescription>
              Validates locally today; connect `onSubmitAction` to your API when
              the backend is ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Vintage desk lamp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Condition, dimensions, pickup details…"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Buyers appreciate specifics—shipping, flaws, and usage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="120.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save draft
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
