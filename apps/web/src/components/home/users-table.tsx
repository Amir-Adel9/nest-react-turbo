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

export function UsersTable({ users, currentUserEmail }: UsersTableProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/50'>
            <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
              User
            </th>
            <th className='px-4 py-2.5 text-left font-medium text-muted-foreground'>
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
              <td className='px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <UserAvatar name={u.name} />
                  <span className='font-medium'>
                    {u.name}
                    {u.email === currentUserEmail && (
                      <span className='ml-1.5 text-xs text-muted-foreground'>
                        (you)
                      </span>
                    )}
                  </span>
                </div>
              </td>
              <td className='px-4 py-3 text-muted-foreground'>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
