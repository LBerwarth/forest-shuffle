-- Fix views to use SECURITY INVOKER so they respect RLS policies of the
-- querying user instead of the view owner (SECURITY DEFINER default).

alter view player_strategy set (security_invoker = true);
alter view leaderboard set (security_invoker = true);
