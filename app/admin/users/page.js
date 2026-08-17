// Author Management (PRD §11): every author and visitor account, their
// role, submission count, and account status. Admin accounts are managed
// separately and don't appear in this directory.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UserActions from "@/components/admin/UserActions";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import styles from "../admin.module.css";

const ROLE_LABEL = { ADMIN: "Admin", AUTHOR: "Author", USER: "Visitor" };

const SORT_COLUMNS = {
  name: { label: "Name", orderBy: (dir) => ({ name: dir }) },
  role: { label: "Role", orderBy: (dir) => ({ role: dir }) },
  blogs: { label: "Articles", orderBy: (dir) => ({ blogs: { _count: dir } }) },
  joined: { label: "Joined", orderBy: (dir) => ({ createdAt: dir }) },
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name) {
  return (
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "?"
  );
}

function sortHref(column, activeSort, activeDir, q, role) {
  const nextDir = activeSort === column && activeDir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  params.set("sort", column);
  params.set("dir", nextDir);
  return `/admin/users?${params.toString()}`;
}

export default async function AdminUsersPage({ searchParams }) {
  const role = searchParams?.role || "";
  const q = (searchParams?.q || "").trim();
  const sort = SORT_COLUMNS[searchParams?.sort] ? searchParams.sort : "joined";
  const dir = searchParams?.dir === "asc" ? "asc" : "desc";

  const where = { role: { not: "ADMIN" } };
  if (role && ["AUTHOR", "USER"].includes(role)) where.role = role;
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }];

  const [users, totalAuthors, totalVisitors, totalBlocked, totalSubmissions, allNonAdminUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: SORT_COLUMNS[sort].orderBy(dir),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        isActive: true,
        createdAt: true,
        _count: { select: { blogs: true } },
      },
    }),
    prisma.user.count({ where: { role: "AUTHOR" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { isActive: false, role: { not: "ADMIN" } } }),
    prisma.blog.count(),
    prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalAccounts = totalAuthors + totalVisitors;
  const hasFilters = Boolean(role || q);

  function th(column, extraClass) {
    const { label } = SORT_COLUMNS[column];
    const isActive = sort === column;
    return (
      <th className={`${styles.sortableTh} ${extraClass || ""}`}>
        <Link href={sortHref(column, sort, dir, q, role)}>
          {label}
          {isActive && <span className={styles.sortArrow}>{dir === "asc" ? "▲" : "▼"}</span>}
        </Link>
      </th>
    );
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <div className={styles.breadcrumbs}><span>Workspace</span><span aria-hidden="true">/</span><span>People</span></div>
          <p className={styles.eyebrow}>People & permissions</p>
          <h1 className={styles.title}>Authors</h1>
        </div>
        <Link href="/admin/users/new" className={`${styles.btn} ${styles.btnPrimary} ${styles.addAuthorButton}`}>
          <span aria-hidden="true">+</span> Add author
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardLead}`}>
          <div className={styles.statLabel}>Total accounts</div>
          <div className={styles.statValue}>{totalAccounts}</div>
          <div className={styles.statHint}>Everyone with access</div>
        </div>
        <div className={`${styles.statCard} ${styles.accentAmber}`}>
          <div className={styles.statLabel}>Authors</div>
          <div className={styles.statValue}>{totalAuthors}</div>
          <div className={styles.statHint}>Can submit articles</div>
        </div>
        <div className={`${styles.statCard} ${styles.accentGreen}`}>
          <div className={styles.statLabel}>Total articles</div>
          <div className={styles.statValue}>{totalSubmissions}</div>
          <div className={styles.statHint}>Across all statuses</div>
        </div>
        <div className={`${styles.statCard} ${styles.accentRed}`}>
          <div className={styles.statLabel}>Blocked</div>
          <div className={styles.statValue}>{totalBlocked}</div>
          <div className={styles.statHint}>Review access regularly</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Contributor directory</h2>
          </div>
          <span className={styles.panelMeta}>{users.length} visible</span>
        </div>
        <form className={styles.filterBar} method="GET">
          <label className={styles.filterSearch}>
            <span className={styles.filterLabel}>Find a person</span>
            <input type="text" name="q" defaultValue={q} placeholder="Search name or email…" className={styles.searchInput} />
          </label>
          <label className={styles.filterSelect}>
            <span className={styles.filterLabel}>Role</span>
            <select name="role" defaultValue={role} className={styles.select}>
              <option value="">All roles</option>
              <option value="AUTHOR">Author</option>
              <option value="USER">Visitor</option>
            </select>
          </label>
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="dir" value={dir} />
          <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>Apply filters</button>
        </form>

        <div className={styles.resultsBar}>
          <span>{users.length} account{users.length === 1 ? "" : "s"} {hasFilters ? "match your filters" : "in the directory"}</span>
          {hasFilters && <Link href="/admin/users" className={styles.clearLink}>Clear filters</Link>}
        </div>

        {users.length === 0 ? (
          <div className={styles.empty}>
            <strong>No accounts found</strong>
            <span>Try a different search or create a new author profile.</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {th("name")}
                  {th("role")}
                  {th("blogs", styles.tdCenter)}
                  {th("joined")}
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.authorCell}>
                        <span className={styles.authorAvatar} aria-hidden="true">{initials(user.name)}</span>
                        <div className={styles.titleCellText}>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                          {user.bio && <small className={styles.authorBioPreview}>{user.bio}</small>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`${styles.roleBadge} ${styles["role" + user.role]}`}>{ROLE_LABEL[user.role]}</span></td>
                    <td className={styles.tdCenter}>
                      <Link href={`/admin/users/${user.id}`} className={`${styles.countPill} ${user._count.blogs === 0 ? styles.countZero : ""}`}>{user._count.blogs}</Link>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><span className={user.isActive ? styles.dotActive : styles.dotInactive}>{user.isActive ? "Active" : "Blocked"}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/admin/users/${user.id}`} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>View profile</Link>
                        <UserActions user={user} />
                        <DeleteUserButton user={user} blogsCount={user._count.blogs} otherAuthors={allNonAdminUsers.filter((author) => author.id !== user.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
