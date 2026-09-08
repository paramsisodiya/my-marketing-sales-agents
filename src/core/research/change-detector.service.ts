import { IChangeDetectionReport, IChangeItem, ILeadIntelligenceProfile } from '../types/lead-intelligence.types';

export class ChangeDetectorService {
  private static instance: ChangeDetectorService;

  public static getInstance(): ChangeDetectorService {
    if (!ChangeDetectorService.instance) {
      ChangeDetectorService.instance = new ChangeDetectorService();
    }
    return ChangeDetectorService.instance;
  }

  /**
   * Compares the previous intelligence profile with current findings to detect meaningful shifts.
   */
  public detectChanges(
    previous: Partial<ILeadIntelligenceProfile> | undefined,
    current: ILeadIntelligenceProfile
  ): IChangeDetectionReport {
    if (!previous) {
      return {
        hasChanges: false,
        changesCount: 0,
        changes: [],
      };
    }

    const changes: IChangeItem[] = [];

    // 1. Title Change
    if (previous.seo?.title && current.seo.title && previous.seo.title !== current.seo.title) {
      changes.push({
        field: 'seo.title',
        previousValue: previous.seo.title,
        newValue: current.seo.title,
        significance: 'INFORMATIONAL',
        description: `Page title changed from "${previous.seo.title}" to "${current.seo.title}"`,
      });
    }

    // 2. Significant Latency Shift (>50% difference and >500ms delta)
    const prevLatency = previous.website?.responseTimeMs;
    const currLatency = current.website.responseTimeMs;
    if (prevLatency !== undefined && currLatency !== undefined) {
      const delta = Math.abs(currLatency - prevLatency);
      const percentChange = delta / prevLatency;
      if (percentChange > 0.5 && delta > 500) {
        changes.push({
          field: 'website.responseTimeMs',
          previousValue: `${prevLatency}ms`,
          newValue: `${currLatency}ms`,
          significance: 'MAJOR',
          description: `Server response latency changed significantly from ${prevLatency}ms to ${currLatency}ms (${(percentChange * 100).toFixed(0)}% shift)`,
        });
      }
    }

    // 3. Schema.org Changes
    const prevSchema = previous.localSearch?.hasLocalBusinessSchema;
    const currSchema = current.localSearch.hasLocalBusinessSchema;
    if (prevSchema !== undefined && prevSchema !== currSchema) {
      changes.push({
        field: 'localSearch.hasLocalBusinessSchema',
        previousValue: prevSchema,
        newValue: currSchema,
        significance: 'MAJOR',
        description: currSchema
          ? 'New Schema.org LocalBusiness structured data implemented on website'
          : 'Schema.org LocalBusiness structured data was removed from website',
      });
    }

    // 4. WhatsApp Trigger Changes
    const prevWhatsApp = previous.conversion?.hasWhatsAppWidget;
    const currWhatsApp = current.conversion.hasWhatsAppWidget;
    if (prevWhatsApp !== undefined && prevWhatsApp !== currWhatsApp) {
      changes.push({
        field: 'conversion.hasWhatsAppWidget',
        previousValue: prevWhatsApp,
        newValue: currWhatsApp,
        significance: 'MAJOR',
        description: currWhatsApp
          ? 'WhatsApp click-to-chat trigger added to website'
          : 'WhatsApp click-to-chat trigger was removed from website',
      });
    }

    // 5. CMS / Tech Stack Changes
    const prevCms = previous.website?.detectedCms;
    const currCms = current.website.detectedCms;
    if (prevCms && currCms && prevCms !== currCms) {
      changes.push({
        field: 'website.detectedCms',
        previousValue: prevCms,
        newValue: currCms,
        significance: 'MAJOR',
        description: `Underlying website CMS changed from ${prevCms} to ${currCms}`,
      });
    }

    // 6. Contact Changes (Phone / Email)
    const prevPhones = (previous.contact?.publicPhones || []).map(p => p.value).sort().join(', ');
    const currPhones = current.contact.publicPhones.map(p => p.value).sort().join(', ');
    if (prevPhones && currPhones && prevPhones !== currPhones) {
      changes.push({
        field: 'contact.publicPhones',
        previousValue: prevPhones,
        newValue: currPhones,
        significance: 'MAJOR',
        description: `Detected public telephone numbers updated: "${currPhones}"`,
      });
    }

    // 7. Lead Score Shifts (>= 5 points)
    const prevScore = previous.leadScoring?.leadScore;
    const currScore = current.leadScoring.leadScore;
    if (prevScore !== undefined && Math.abs(currScore - prevScore) >= 5) {
      changes.push({
        field: 'leadScoring.leadScore',
        previousValue: prevScore,
        newValue: currScore,
        significance: 'MINOR',
        description: `Lead Qualification Score shifted by ${currScore - prevScore > 0 ? '+' : ''}${currScore - prevScore} points (now ${currScore}/100)`,
      });
    }

    return {
      hasChanges: changes.length > 0,
      changesCount: changes.length,
      changes,
      previousRunTimestamp: previous.researchTimestamp,
    };
  }
}
