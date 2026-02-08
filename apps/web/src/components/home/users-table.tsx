import { UserAvatar } from '@/components/user-avatar';

export type UserRow = {
  id: string;
  name: string;
  email: string;
};

type UsersTableProps = {
  users: UserRow[];
  currentUserEmail: string;
};

function UserRowContent({
  u,
  isCurrentUser,
}: {
  u: UserRow;
  isCurrentUser: boolean;
}) {
  return (
    <div className='flex items-center gap-3'>
      <UserAvatar name={u.name} />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium' title={u.name}>
          {u.name}
          {isCurrentUser && (
            <span className='ml-1.5 text-xs text-muted-foreground'>
              (you)
            </span>
          )}
        </p>
        <p className='truncate text-xs text-muted-foreground' title={u.email}>
          {u.email}
        </p>
      </div>
    </div>
  );
}

export function UsersTable({ users, currentUserEmail }: UsersTableProps) {
  return (
    <>
      {/* Responsive: list with email as subtext under name */}
      <div className='space-y-0 rounded-lg border border-border md:hidden'>
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`px-4 py-3 transition-colors hover:bg-muted/40 ${
              i < users.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <UserRowContent
              u={u}
              isCurrentUser={u.email === currentUserEmail}
            />
          </div>
        ))}
      </div>

      {/* Desktop: table with 2 columns */}
      <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
        <table className='w-full min-w-[400px] table-fixed text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/50'>
              <th className='w-1/2 px-4 py-2.5 text-left font-medium text-muted-foreground'>
                User
              </th>
              <th className='w-1/2 px-4 py-2.5 text-left font-medium text-muted-foreground'>
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={`transition-colors hover:bg-muted/40 ${
                  i < users.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <td className='overflow-hidden px-4 py-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <UserAvatar name={u.name} />
                    <span
                      className='block truncate font-medium'
                      title={u.name}
                    >
                      {u.name}
                      {u.email === currentUserEmail && (
                        <span className='ml-1.5 text-xs text-muted-foreground'>
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className='overflow-hidden px-4 py-3 text-muted-foreground'>
                  <span className='block truncate' title={u.email}>
                    {u.email}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
