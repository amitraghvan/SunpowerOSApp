import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { QueueModule } from './infrastructure/queues/queue.module';
import { HealthModule } from './infrastructure/health/health.module';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { validateEnvironment } from './config/env.validation';

// Domain Modules Import
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AuditModule } from './modules/audit/audit.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';

import { CrmModule } from './modules/crm/crm.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EngineeringModule } from './modules/engineering/engineering.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';

import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PlanningModule } from './modules/planning/planning.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';

import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { SerialRegistryModule } from './modules/serial-registry/serial-registry.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { LogisticsModule } from './modules/logistics/logistics.module';

import { WorkforceModule } from './modules/workforce/workforce.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { TimesheetsModule } from './modules/timesheets/timesheets.module';
import { InstallationModule } from './modules/installation/installation.module';
import { CommissioningModule } from './modules/commissioning/commissioning.module';

import { WarrantyModule } from './modules/warranty/warranty.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ServiceModule } from './modules/service/service.module';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module';
import { ReplacementModule } from './modules/replacement/replacement.module';

import { FinanceModule } from './modules/finance/finance.module';
import { InvoicingModule } from './modules/invoicing/invoicing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { ProjectCostingModule } from './modules/project-costing/project-costing.module';

import { SubsidyModule } from './modules/subsidy/subsidy.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AiCopilotModule } from './modules/ai-copilot/ai-copilot.module';

@Module({
  imports: [
    // Configuration & Environment Validation
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),

    // Technical Infrastructure
    DatabaseModule,
    RedisModule,
    StorageModule,
    QueueModule,
    HealthModule,

    // Foundation Domains
    IdentityModule,
    OrganizationsModule,
    AccessControlModule,
    EmployeesModule,
    AuditModule,
    ConfigurationModule,

    // Commercial Domains
    CrmModule,
    CustomersModule,
    SurveysModule,
    CatalogModule,
    EngineeringModule,
    QuotationsModule,
    ContractsModule,
    SalesOrdersModule,

    // Project Management Domains
    ProjectsModule,
    TasksModule,
    PlanningModule,
    SchedulingModule,

    // Supply Chain Domains
    SuppliersModule,
    ProcurementModule,
    InventoryModule,
    WarehousesModule,
    SerialRegistryModule,
    DispatchModule,
    LogisticsModule,

    // Field Operations Domains
    WorkforceModule,
    AttendanceModule,
    TimesheetsModule,
    InstallationModule,
    CommissioningModule,

    // After-Sales Domains
    WarrantyModule,
    MaintenanceModule,
    ServiceModule,
    HelpdeskModule,
    ReplacementModule,

    // Finance Domains
    FinanceModule,
    InvoicingModule,
    PaymentsModule,
    ExpensesModule,
    AccountingModule,
    ProjectCostingModule,

    // Supporting Services
    SubsidyModule,
    DocumentsModule,
    NotificationsModule,
    CommunicationsModule,
    AnalyticsModule,
    WorkflowModule,
    IntegrationsModule,
    AiCopilotModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('{*path}');
  }
}
