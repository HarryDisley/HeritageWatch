-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('SAFE', 'MODERATE_CONCERN', 'HIGH_CONCERN', 'CRITICAL_CONCERN');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('CONFIRMED', 'SUPPORTED', 'DEVELOPING', 'INSUFFICIENT_EVIDENCE');

-- CreateEnum
CREATE TYPE "ThreatCategoryType" AS ENUM ('ARMED_CONFLICT', 'NATURAL_DISASTER', 'ENVIRONMENTAL_CLIMATE', 'CONSERVATION_STRUCTURAL');

-- CreateEnum
CREATE TYPE "SourceTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4');

-- CreateEnum
CREATE TYPE "DpiCategory" AS ENUM ('PHOTOGRAPHIC', 'ARCHIVAL_RECORDS', 'THREE_D_DOCUMENTATION', 'VIRTUAL_TOUR', 'ACADEMIC_SCHOLARLY');

-- CreateEnum
CREATE TYPE "DpiTier" AS ENUM ('EXTENSIVE', 'MODERATE', 'LIMITED', 'MINIMAL');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('CULTURAL', 'NATURAL', 'MIXED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternateNames" TEXT[],
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "coordinateNote" TEXT,
    "unescoId" TEXT,
    "inscriptionYear" INTEGER,
    "unescoListingName" TEXT,
    "isSerialComponent" BOOLEAN NOT NULL DEFAULT false,
    "serialComponentNote" TEXT,
    "siteType" "SiteType" NOT NULL,
    "significanceSummary" TEXT NOT NULL,
    "dpiTier" "DpiTier",
    "dpiCoverageNote" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "lastVerifiedDate" TIMESTAMP(3),
    "editorialChecklist" JSONB,
    "changelog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatCategory" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "category" "ThreatCategoryType" NOT NULL,
    "evidenceSummary" TEXT NOT NULL,
    "firstIdentifiedDate" TIMESTAMP(3),
    "dateNote" TEXT,

    CONSTRAINT "ThreatCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEntry" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "decisionTrigger" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "approvalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "dateDisplay" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "tier" "SourceTier" NOT NULL,
    "reliabilityNote" TEXT,
    "publishedDate" TIMESTAMP(3),
    "publishedDateDisplay" TEXT,
    "accessedDate" TIMESTAMP(3),

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalPreservationEvidence" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "category" "DpiCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "DigitalPreservationEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatCategorySource" (
    "threatCategoryId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "ThreatCategorySource_pkey" PRIMARY KEY ("threatCategoryId","sourceId")
);

-- CreateTable
CREATE TABLE "StatusEntrySource" (
    "statusEntryId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "StatusEntrySource_pkey" PRIMARY KEY ("statusEntryId","sourceId")
);

-- CreateTable
CREATE TABLE "EventSource" (
    "eventId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "EventSource_pkey" PRIMARY KEY ("eventId","sourceId")
);

-- CreateTable
CREATE TABLE "SiteMetadataSource" (
    "siteId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "SiteMetadataSource_pkey" PRIMARY KEY ("siteId","sourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE INDEX "ThreatCategory_siteId_idx" ON "ThreatCategory"("siteId");

-- CreateIndex
CREATE INDEX "StatusEntry_siteId_effectiveDate_idx" ON "StatusEntry"("siteId", "effectiveDate");

-- CreateIndex
CREATE INDEX "Event_siteId_idx" ON "Event"("siteId");

-- CreateIndex
CREATE INDEX "Source_siteId_idx" ON "Source"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Source_siteId_sourceKey_key" ON "Source"("siteId", "sourceKey");

-- CreateIndex
CREATE INDEX "DigitalPreservationEvidence_siteId_idx" ON "DigitalPreservationEvidence"("siteId");

-- AddForeignKey
ALTER TABLE "ThreatCategory" ADD CONSTRAINT "ThreatCategory_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEntry" ADD CONSTRAINT "StatusEntry_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPreservationEvidence" ADD CONSTRAINT "DigitalPreservationEvidence_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPreservationEvidence" ADD CONSTRAINT "DigitalPreservationEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatCategorySource" ADD CONSTRAINT "ThreatCategorySource_threatCategoryId_fkey" FOREIGN KEY ("threatCategoryId") REFERENCES "ThreatCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatCategorySource" ADD CONSTRAINT "ThreatCategorySource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEntrySource" ADD CONSTRAINT "StatusEntrySource_statusEntryId_fkey" FOREIGN KEY ("statusEntryId") REFERENCES "StatusEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEntrySource" ADD CONSTRAINT "StatusEntrySource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteMetadataSource" ADD CONSTRAINT "SiteMetadataSource_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteMetadataSource" ADD CONSTRAINT "SiteMetadataSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
