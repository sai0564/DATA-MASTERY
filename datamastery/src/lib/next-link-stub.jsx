import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, children, ...props }) {
  // Map href to to for React Router compatibility
  return (
    <RouterLink to={href || '#'} {...props}>
      {children}
    </RouterLink>
  );
}
