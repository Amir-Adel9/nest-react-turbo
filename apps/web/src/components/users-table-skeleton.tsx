export function UsersTableSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='size-9 animate-pulse rounded-full bg-muted' />
          <div className='flex-1 space-y-1.5'>
            <div className='h-3.5 w-28 animate-pulse rounded bg-muted' />
            <div className='h-3 w-40 animate-pulse rounded bg-muted' />
          </div>
        </div>
      ))}
    </div>
  );
}
