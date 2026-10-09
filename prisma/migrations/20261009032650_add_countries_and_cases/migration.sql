-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PARTY', 'SIGNED_NOT_RATIFIED', 'NOT_PARTY');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('INTERNATIONAL_CRIMINAL', 'INTERNATIONAL_COURT', 'TRIBUNAL', 'SECURITY_COUNCIL_OR_UN_ACTION', 'RESTITUTION_OR_DISPUTE', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseSection" AS ENUM ('SUMMARY', 'LEGAL_BASIS', 'OUTCOME', 'INTERPRETATION');

-- CreateTable
CREATE TABLE "Treaty" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adoptedYear" INTEGER,
    "depositary" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Treaty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "lastVerifiedDate" TIMESTAMP(3),
    "changelog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatyMembership" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "treatyId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL,
    "actionType" TEXT,
    "date" TIMESTAMP(3),
    "dateDisplay" TEXT,
    "note" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "TreatyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountrySource" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
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

    CONSTRAINT "CountrySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteCountry" (
    "siteId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "SiteCountry_pkey" PRIMARY KEY ("siteId","countryId")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "body" TEXT NOT NULL,
    "caseReference" TEXT,
    "summary" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "interpretation" TEXT,
    "startDate" TIMESTAMP(3),
    "startDateDisplay" TEXT,
    "endDate" TIMESTAMP(3),
    "endDateDisplay" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "lastVerifiedDate" TIMESTAMP(3),
    "changelog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "dateDisplay" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSource" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
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

    CONSTRAINT "CaseSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseEventSource" (
    "caseEventId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "CaseEventSource_pkey" PRIMARY KEY ("caseEventId","sourceId")
);

-- CreateTable
CREATE TABLE "CaseSectionSource" (
    "caseId" TEXT NOT NULL,
    "section" "CaseSection" NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "CaseSectionSource_pkey" PRIMARY KEY ("caseId","section","sourceId")
);

-- CreateTable
CREATE TABLE "CaseSite" (
    "caseId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "CaseSite_pkey" PRIMARY KEY ("caseId","siteId")
);

-- CreateTable
CREATE TABLE "CaseCountry" (
    "caseId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "CaseCountry_pkey" PRIMARY KEY ("caseId","countryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Treaty_slug_key" ON "Treaty"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "Country"("isoCode");

-- CreateIndex
CREATE INDEX "TreatyMembership_countryId_idx" ON "TreatyMembership"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatyMembership_countryId_treatyId_key" ON "TreatyMembership"("countryId", "treatyId");

-- CreateIndex
CREATE INDEX "CountrySource_countryId_idx" ON "CountrySource"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CountrySource_countryId_sourceKey_key" ON "CountrySource"("countryId", "sourceKey");

-- CreateIndex
CREATE UNIQUE INDEX "Case_slug_key" ON "Case"("slug");

-- CreateIndex
CREATE INDEX "CaseEvent_caseId_idx" ON "CaseEvent"("caseId");

-- CreateIndex
CREATE INDEX "CaseSource_caseId_idx" ON "CaseSource"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSource_caseId_sourceKey_key" ON "CaseSource"("caseId", "sourceKey");

-- AddForeignKey
ALTER TABLE "TreatyMembership" ADD CONSTRAINT "TreatyMembership_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatyMembership" ADD CONSTRAINT "TreatyMembership_treatyId_fkey" FOREIGN KEY ("treatyId") REFERENCES "Treaty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatyMembership" ADD CONSTRAINT "TreatyMembership_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CountrySource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountrySource" ADD CONSTRAINT "CountrySource_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCountry" ADD CONSTRAINT "SiteCountry_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteCountry" ADD CONSTRAINT "SiteCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSource" ADD CONSTRAINT "CaseSource_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEventSource" ADD CONSTRAINT "CaseEventSource_caseEventId_fkey" FOREIGN KEY ("caseEventId") REFERENCES "CaseEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEventSource" ADD CONSTRAINT "CaseEventSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CaseSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSectionSource" ADD CONSTRAINT "CaseSectionSource_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSectionSource" ADD CONSTRAINT "CaseSectionSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CaseSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSite" ADD CONSTRAINT "CaseSite_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSite" ADD CONSTRAINT "CaseSite_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseCountry" ADD CONSTRAINT "CaseCountry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseCountry" ADD CONSTRAINT "CaseCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
