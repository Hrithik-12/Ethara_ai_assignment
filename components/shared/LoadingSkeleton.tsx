import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-1 w-full" />
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

export function TaskRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-3">
        <Skeleton className="h-4 w-3/4" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-16" />
    </Card>
  );
}
