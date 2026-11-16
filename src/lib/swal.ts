import Swal from 'sweetalert2'

/**
 * Show a confirmation dialog. Returns true if the user confirms.
 */
export async function confirmDelete(message = 'Are you sure?'): Promise<boolean> {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
  })

  return result.isConfirmed
}

/**
 * Show a generic confirmation dialog with custom text.
 */
export async function confirmAction(options: {
  title: string
  text?: string
  confirmButtonText?: string
  cancelButtonText?: string
}): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: options.confirmButtonText ?? 'Yes',
    cancelButtonText: options.cancelButtonText ?? 'Cancel',
  })

  return result.isConfirmed
}

/**
 * Show a success toast notification (auto-dismisses after 2 seconds).
 */
export function successToast(message: string): void {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    icon: 'success',
    title: message,
  })
}

/**
 * Show an error toast notification (auto-dismisses after 4 seconds).
 */
export function errorToast(message: string): void {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: 'error',
    title: message,
  })
}

/**
 * Show an info toast notification.
 */
export function infoToast(message: string): void {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: 'info',
    title: message,
  })
}

/**
 * Show a success modal that navigates after confirmation.
 * Returns a promise that resolves when the user confirms.
 */
export async function successModal(message: string): Promise<void> {
  await Swal.fire({
    title: 'Success',
    text: message,
    icon: 'success',
    confirmButtonColor: '#2563eb',
  })
}

/**
 * Show an error modal with a list of validation errors.
 */
export function validationErrorsDialog(errors: Record<string, string[]>): void {
  const html = Object.entries(errors)
    .map(([field, messages]) => messages.map((m) => `• ${field}: ${m}`).join('<br>'))
    .join('<br>')

  Swal.fire({
    title: 'Validation Error',
    html: html,
    icon: 'error',
    confirmButtonColor: '#d33',
  })
}

/**
 * Show a generic info modal.
 */
export function infoModal(title: string, text: string): void {
  Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#2563eb',
  })
}
