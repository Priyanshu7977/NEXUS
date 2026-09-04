import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ROUTE_NAME_MAP: Record<string, string> = {
  app: 'Workspace',
  agents: 'Agents',
  new: 'Create New',
  connectors: 'Connectors',
  workflows: 'Workflows',
  activity: 'Activity',
  usage: 'Usage',
  settings: 'Settings',
  general: 'General',
  workspace: 'Workspace',
  security: 'Security',
  permissions: 'Permissions',
  api: 'API Keys',
  billing: 'Billing'
};

export const AppBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#111318]">
        <span className="text-[#8B919B]">NEXUS /</span>
        <span>Overview</span>
      </div>
    );
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    const label = ROUTE_NAME_MAP[segment] || (segment.startsWith('ag_') ? 'Agent Details' : segment.startsWith('wf_') ? 'Workflow Details' : segment.startsWith('exec_') ? 'Execution Details' : segment.toUpperCase());

    return {
      label,
      path,
      isLast
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
      <span className="text-[#8B919B] hidden sm:inline">NEXUS</span>
      {breadcrumbItems.map((item) => (
        <React.Fragment key={item.path}>
          <ChevronRight className="w-3.5 h-3.5 text-[#8B919B] shrink-0" />
          {item.isLast ? (
            <span className="font-bold text-[#111318] truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-[#626873] hover:text-[#111318] transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
