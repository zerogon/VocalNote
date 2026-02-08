'use client';

import { Button, type ButtonProps } from '@/components/ui';
import { logout } from '@/actions/auth';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

export function LogoutButton({
  children = '로그아웃',
  ...props
}: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" {...props}>
        {children}
      </Button>
    </form>
  );
}
