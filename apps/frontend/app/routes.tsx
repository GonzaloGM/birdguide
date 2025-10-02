import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/_index.tsx'),
  route('login', './routes/login.tsx'),
  route('signup', './routes/signup.tsx'),
  route('about', './routes/about.tsx'),
  route('practice', './routes/practice.tsx'),
  route('path', './routes/path.tsx'),
  route('species', './routes/species.tsx'),
  route('species/:id', './routes/species-detail.tsx'),
  route('profile', './routes/profile.tsx'),
] satisfies RouteConfig;
