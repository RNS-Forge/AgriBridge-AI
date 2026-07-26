import { forwardRef, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className = "",
      children,
      ...props
    },
    ref
  ) => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table
        ref={ref}
        className={`w-full border-collapse text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = "Table";

/* -------------------------------------------------------------------------- */

export const TableHead = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <thead
    ref={ref}
    className={`
      bg-gray-50
      border-b border-gray-200
      ${className}
    `}
    {...props}
  />
));

TableHead.displayName = "TableHead";

/* -------------------------------------------------------------------------- */

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-gray-200 ${className}`}
    {...props}
  />
));

TableBody.displayName = "TableBody";

/* -------------------------------------------------------------------------- */

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      selected = false,
      className = "",
      ...props
    },
    ref
  ) => (
    <tr
      ref={ref}
      className={`
        transition-colors duration-200
        even:bg-white
        hover:bg-gray-50
        ${selected ? "bg-emerald-100" : ""}
        ${className}
      `}
      {...props}
    />
  )
);

TableRow.displayName = "TableRow";

/* -------------------------------------------------------------------------- */

export const TableHeader = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={`
      px-6
      py-3
      text-left
      text-xs
      font-semibold
      uppercase
      tracking-wide
      text-gray-600
      ${className}
    `}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

/* -------------------------------------------------------------------------- */

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <td
    ref={ref}
    className={`
      px-6
      py-4
      text-gray-700
      ${className}
    `}
    {...props}
  />
));

TableCell.displayName = "TableCell";