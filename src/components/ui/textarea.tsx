import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>((
  { className, ...props },
  ref
) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => textAreaRef.current as HTMLTextAreaElement);

  React.useLayoutEffect(() => {
    const el = textAreaRef.current;
    if (el) {
      el.style.height = 'inherit';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [props.value]);

  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={textAreaRef}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
