# Secure software development action plan & Snyk vulnerability report

# Part 1 --- Secure software development action plan

## Introduction

Writing secure software is an essential responsibility for developers.
Modern applications depend on many third‑party libraries, APIs, and
frameworks. While these tools speed up development, they also introduce
potential security risks. If developers do not actively monitor their
dependencies and follow secure development practices, vulnerabilities
may enter their applications without them realizing it.

Before this assignment, my development workflow mainly focused on
functionality and performance. Security checks were not performed
regularly and dependency updates were only applied when they were needed
for new features. This approach can lead to outdated libraries that
contain known vulnerabilities.

The following action plan describes how my development workflow will
change in order to ensure that future software projects follow stronger
security practices.

## Step 1 --- Regular dependency security scanning

From now on, every project will be scanned regularly using security
scanning tools such as **Snyk** or **npm audit**. These tools analyze
project dependencies and compare them against known vulnerability
databases.

Instead of only scanning when problems occur, security scans will be
integrated into the normal development process. This means:

- Running a dependency scan before releasing a project
- Running scans after installing new packages
- Monitoring vulnerabilities through automated alerts

By continuously monitoring dependencies, vulnerabilities can be
discovered early before they reach production systems.

## Step 2 --- Integrating security into the development workflow

Security scanning tools can be integrated into CI/CD pipelines. This
means every commit or pull request can automatically trigger a security
scan.

In the future, projects should include automated security checks that:

- Scan dependencies for vulnerabilities
- Prevent builds from passing if critical vulnerabilities are detected
- Alert developers when vulnerabilities appear

This ensures that security issues are caught immediately during
development rather than after deployment.

## Step 3 --- Minimizing third‑party dependencies

Modern JavaScript applications often rely on hundreds or thousands of
dependencies. Each dependency introduces potential security risks.

To improve security, developers should minimize unnecessary libraries.
When choosing dependencies, developers should:

- Prefer well‑maintained libraries
- Avoid packages with poor maintenance or outdated versions
- Evaluate whether a dependency is truly necessary

In many cases, simple functionality can be implemented directly in the
codebase rather than adding another external dependency.

## Step 4 --- Secure input handling

Another important secure coding practice is validating and sanitizing
all external input. Even if dependencies are secure, improper input
validation can still lead to vulnerabilities such as:

- Injection attacks
- Cross‑site scripting (XSS)
- Improper serialization vulnerabilities

All user input should be validated on both the client and server side to
ensure that only expected data formats are accepted.

## Step 5 --- Learning from the Log4j (Log4Shell) vulnerability

One of the most important security incidents in recent years was the
**Log4Shell vulnerability** discovered in the Log4j logging library in

2021. This vulnerability allowed attackers to execute remote code on
      servers using specially crafted log messages.

The Log4Shell vulnerability demonstrated how dangerous widely used
dependencies can be when they contain security flaws. Because Log4j was
used by thousands of applications, a single vulnerability affected large
parts of the internet.

The key lessons from this event include:

- Dependencies must be monitored continuously
- Security patches must be applied quickly
- Developers must understand the libraries used in their projects

This incident highlights why dependency monitoring tools such as Snyk
are essential for modern development.

## Step 6 --- Continuous security education

Security threats evolve constantly. Developers must stay informed about
new vulnerabilities and best practices.

Future development practices should include:

- Following security organizations such as OWASP
- Reviewing vulnerability databases like NVD
- Staying informed about security advisories

Security awareness helps developers anticipate risks and design safer
software systems.

## Conclusion of the action plan

Going forward, my development workflow will include regular dependency
scanning, CI/CD security integration, dependency minimization, strict
input validation, and continuous learning about security threats. By
implementing these steps, future software projects will be developed
with stronger security practices and reduced vulnerability risks.

# Part 2 --- Snyk security vulnerability report

## Introduction

To analyze the security of a web application, I used **Snyk** to scan my
personal portfolio project. The application is built using the Nuxt.js
framework and managed with npm dependencies.

The goal of this scan was to identify vulnerabilities in the dependency
tree, fix them where possible, and document the results.

Two scans were performed:

1. Initial scan showing detected vulnerabilities
2. A second scan after applying dependency updates

Screenshots from the Snyk dashboard are included in the report as proof.

## Initial Snyk scan

![](/public/img/initial-scan.png)

The first scan revealed several vulnerabilities across multiple severity
levels. Unfortunately, I only made a screenshot of the summary page, so specific details are not visible. However, I
shall explain the general findings based on the summary.

### Vulnerability summary

```
Critical: 2
High: 19
Medium: 7
Low: 1
```

Most vulnerabilities were introduced through **transitive
dependencies**, meaning they were not directly installed but included by
other libraries.

### Directory traversal

Dependency: supabase@2.66.0

Severity: High\
CVSS Score: 8.4

Directory traversal vulnerabilities allow attackers to access files
outside the intended directory structure. If exploited, this
vulnerability could potentially expose sensitive files on a server.

### Improper unicode handling

Dependency: supabase@2.66.0

Severity: Medium

Improper handling of Unicode encoding may allow attackers to bypass
validation checks by using specially encoded characters.

### Arbitrary code injection

Dependency: nuxt@4.2.1\
Affected package: serialize-javascript

Severity: High

This vulnerability could allow malicious code execution if untrusted
data is serialized incorrectly.

## Fixing the vulnerabilities

To resolve these issues, the recommended solutions provided by Snyk were
applied.

### Updating Supabase

The dependency was updated to a newer version which resolved multiple
vulnerabilities.

Before: supabase@2.66.0

After: supabase@2.76.10

Command used:

```
npm install supabase@latest
```

### Updating all project dependencies

Next, all project dependencies were updated to ensure the latest secure
versions were installed.

Commands used:

```
npm update
npm audit fix
```

### Rebuilding the dependency tree

To ensure no outdated dependencies remained, the dependency tree was
rebuilt.

Commands used:

```
rm -rf node_modules
rm package-lock.json
npm install
```

## Snyk scan after fixes

After applying the updates, a second Snyk scan was performed.

![](/public/img/post-fix.png)

The results showed:

- Near all vulnerabilities resolved
- Dependency tree updated to secure versions
- Remaining issues were related to upstream packages without immediate
  fixes
- .output folder was also updated to reflect the changes

This demonstrates that regularly updating dependencies significantly
improves application security.

## Conclusion

The Snyk analysis showed that many vulnerabilities in modern web
applications originate from third‑party dependencies. By updating
dependencies and rebuilding the project's dependency tree, several
security issues were successfully mitigated.

Security scanning tools such as Snyk are essential for identifying these
risks and ensuring that applications remain secure as dependencies
evolve.

## References

[OWASP Foundation -- OWASP Top Ten](https://owasp.org)

[Snyk Vulnerability Database](https://snyk.io)

[National Vulnerability Database (NVD)](https://nvd.nist.gov)
