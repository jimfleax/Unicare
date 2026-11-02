import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface SelectContextValue {
  value?: string;
  onValueChange?: (val: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({});

const Select = ({
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {children}
    </SelectPrimitive.Root>
  </SelectContext.Provider>
);

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> {
  value?: string;
}

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, value: explicitValue, onChange, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  const activeValue = explicitValue !== undefined ? explicitValue : ctx.value;
  const innerRef = React.useRef<HTMLButtonElement | null>(null);
  const currentValRef = React.useRef(activeValue);
  currentValRef.current = activeValue;

  const defineValueProperty = (el: HTMLButtonElement) => {
    Object.defineProperty(el, "value", {
      get: () => {
        const protoGet = Object.getOwnPropertyDescriptor(
          HTMLButtonElement.prototype,
          "value",
        )?.get;
        const protoVal = protoGet ? protoGet.call(el) : "";
        return protoVal || currentValRef.current;
      },
      set: (v) => {
        currentValRef.current = v;
        const protoSet = Object.getOwnPropertyDescriptor(
          HTMLButtonElement.prototype,
          "value",
        )?.set;
        if (protoSet) protoSet.call(el, v);
      },
      configurable: true,
    });
  };

  React.useImperativeHandle(ref, () => {
    const el = innerRef.current!;
    if (el) {
      defineValueProperty(el);
    }
    return el;
  });

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    defineValueProperty(el);
    const handleNativeChange = (e: Event) => {
      const protoGet = Object.getOwnPropertyDescriptor(
        HTMLButtonElement.prototype,
        "value",
      )?.get;
      const protoVal = protoGet ? protoGet.call(el) : undefined;
      const rawVal = protoVal || (e as any).target?.value;
      if (rawVal !== undefined && ctx.onValueChange) {
        ctx.onValueChange(rawVal);
      }
    };
    el.addEventListener("change", handleNativeChange);
    return () => {
      el.removeEventListener("change", handleNativeChange);
    };
  }, [ctx.onValueChange]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    if (onChange) {
      onChange(e);
    }
    const val = e.target?.value;
    if (val !== undefined && ctx.onValueChange) {
      ctx.onValueChange(val);
    }
  };

  return (
    <SelectPrimitive.Trigger
      ref={innerRef}
      className={`rdx-select-trigger ${className || ""}`}
      onChange={handleChange}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={14} className="rdx-select-icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={`rdx-select-scroll-btn ${className || ""}`}
    {...props}
  >
    <ChevronUp size={14} />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={`rdx-select-scroll-btn ${className || ""}`}
    {...props}
  >
    <ChevronDown size={14} />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`rdx-select-content ${className || ""}`}
      position={position}
      sideOffset={4}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className="rdx-select-viewport">
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`rdx-select-item ${className || ""}`}
    {...props}
  >
    <span className="rdx-select-item-indicator">
      <SelectPrimitive.ItemIndicator>
        <Check size={14} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`rdx-select-label ${className || ""}`}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`rdx-select-separator ${className || ""}`}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
