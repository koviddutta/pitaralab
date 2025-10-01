# Security Policy

## Reporting Security Vulnerabilities

We take the security of MeethaPitara Calculator seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues via one of these methods:

1. **Email**: Send details to [your-security-email@domain.com]
2. **GitHub Security Advisory**: Use the "Security" tab in the repository

### What to Include

Please provide:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Best Practices

### For Contributors

- **Never commit secrets**: API keys, database credentials, or passwords
- **Use environment variables**: Store sensitive config in `.env` (git-ignored)
- **Validate all inputs**: Use Zod schemas for form validation
- **Review RLS policies**: Ensure proper row-level security on all tables
- **Test authentication**: Verify auth flows work correctly

### For Operators

- **Rotate exposed keys immediately**: If any credentials are leaked, rotate them
- **Enable 2FA**: Use two-factor authentication on all accounts
- **Monitor logs**: Check for suspicious activity regularly
- **Keep dependencies updated**: Run `npm audit` periodically
- **Use HTTPS**: Always serve the application over HTTPS in production

## Current Security Architecture

### Authentication
- ✅ Email/password authentication via Supabase Auth
- ✅ Session management with secure tokens
- ✅ Auto-redirect for unauthenticated users
- ✅ Input validation with Zod schemas

### Database Security
- ✅ Row Level Security (RLS) enabled on all user data tables
- ✅ Authenticated-only access for recipes, batches, and pastes
- ⚠️  Public read access on ingredients table (intentional - see notes below)

### API Security
- ✅ Edge functions with automatic rate limiting
- ✅ CORS configured appropriately
- ✅ Environment variables for secrets

## Data Access Policies

### Recipes Table
- **Read**: Authenticated users only
- **Write**: Authenticated users only
- **Reasoning**: Proprietary formulations must be protected

### Batches Table
- **Read**: Authenticated users only
- **Write**: Authenticated users only
- **Reasoning**: Production data is confidential

### Pastes Table
- **Read**: Authenticated users only
- **Write**: Authenticated users only
- **Reasoning**: Paste formulations are trade secrets

### Ingredients Table
- **Read**: Public (authenticated + anonymous)
- **Write**: Authenticated users only
- **Reasoning**: Ingredient database is a shared resource; users need to browse before signup
- ⚠️  **Note**: Cost data is visible to all. If proprietary pricing is a concern, consider:
  1. Restricting read access to authenticated only, OR
  2. Creating a public view without `cost_per_kg` column

### Ingredient Access Log
- **Read**: Users can only see their own access logs
- **Write**: Automatic via triggers
- **Reasoning**: Privacy and audit trail

## Known Security Considerations

### 1. Ingredient Cost Data

**Current State**: Ingredient costs are publicly readable.

**Risk**: Competitors could see your cost structure.

**Mitigation Options**:
- Set all `cost_per_kg` to NULL for public view
- Create RLS policy to restrict read access to authenticated users
- Use a separate `ingredients_public` view without cost data

**Decision Required**: Product owner must decide if costs should be public.

### 2. Rate Limiting

**Current State**: Lovable Cloud provides automatic rate limiting on edge functions.

**Best Practice**: Implement client-side debouncing for AI calls:
```typescript
const debouncedGenerate = useMemo(
  () => debounce(generatePaste, 3000),
  []
);
```

### 3. Input Validation

**Current State**: Zod validation on auth forms.

**Best Practice**: Extend validation to all user inputs:
```typescript
const recipeSchema = z.object({
  name: z.string().min(1).max(100),
  ingredients: z.array(z.object({
    id: z.string().uuid(),
    grams: z.number().positive().max(10000)
  }))
});
```

## Security Checklist for Deployment

Before deploying to production:

- [ ] All `.env` variables are set correctly
- [ ] No secrets committed to git history
- [ ] RLS policies tested and verified
- [ ] Authentication flows work end-to-end
- [ ] HTTPS enforced (automatic with Lovable Cloud)
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't capture passwords or tokens
- [ ] Dependencies audited (`npm audit`)
- [ ] Security headers configured (CSP, HSTS, etc.)

## Incident Response Plan

If a security breach occurs:

1. **Immediate Actions** (within 1 hour)
   - Rotate all API keys and secrets
   - Disable affected user accounts if necessary
   - Take detailed notes of the incident

2. **Investigation** (within 24 hours)
   - Identify the attack vector
   - Assess scope of data exposure
   - Check logs for related activity

3. **Remediation** (within 48 hours)
   - Deploy security fix
   - Notify affected users (if applicable)
   - Update security documentation

4. **Post-Mortem** (within 1 week)
   - Conduct root cause analysis
   - Update security practices
   - Train team on lessons learned

## Security Updates

This document will be updated as:
- New security features are added
- Vulnerabilities are discovered and fixed
- Best practices evolve

Last Updated: [Current Date]
Version: 1.0

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [GitHub Security Lab](https://securitylab.github.com/)

---

**Remember**: Security is an ongoing process, not a one-time task. Stay vigilant! 🔒
