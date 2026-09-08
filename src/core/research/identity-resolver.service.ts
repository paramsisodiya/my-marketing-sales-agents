import { IdentityConfidenceStatus } from '../types/lead-intelligence.types';
import { IWebAnalysisReport } from '../tools/web-analyzer.tool';

export interface IIdentityResolutionResult {
  status: IdentityConfidenceStatus;
  resolvedName: string;
  legalName?: string;
  domain: string;
  verifiedLocations: string[];
  ambiguityReasons: string[];
  evidence: string[];
}

export class IdentityResolverService {
  private static instance: IdentityResolverService;

  public static getInstance(): IdentityResolverService {
    if (!IdentityResolverService.instance) {
      IdentityResolverService.instance = new IdentityResolverService();
    }
    return IdentityResolverService.instance;
  }

  /**
   * Resolves business identity by cross-referencing input parameters, live website DOM data, and search signals.
   */
  public resolveIdentity(params: {
    inputName?: string;
    inputLocation?: string;
    inputUrl?: string;
    webReport?: IWebAnalysisReport;
    searchResults?: any[];
  }): IIdentityResolutionResult {
    const { inputName, inputLocation, inputUrl, webReport, searchResults } = params;
    const ambiguityReasons: string[] = [];
    const evidence: string[] = [];
    const verifiedLocations: string[] = [];

    let domain = '';
    if (webReport?.finalUrl || inputUrl) {
      try {
        const u = new URL(webReport?.finalUrl || inputUrl!);
        domain = u.hostname.replace(/^www\./, '');
      } catch {
        domain = '';
      }
    }

    // 1. Resolve Best Business Name
    let resolvedName = '';
    const title = webReport?.detected?.title || '';
    const cleanTitle = title
      .replace(/^Home\s*[-–|:]\s*/i, '')
      .replace(/\s*[-–|:]\s*Home$/i, '')
      .replace(/\s*[-–|:]\s*(?:Official Site|Welcome|Website)$/i, '')
      .trim();

    if (inputName && inputName !== 'UNKNOWN') {
      resolvedName = inputName.trim();
      evidence.push(`Input business name provided: "${inputName}"`);
    } else if (cleanTitle) {
      resolvedName = cleanTitle;
      evidence.push(`Derived business name from website title: "${cleanTitle}"`);
    } else if (domain) {
      resolvedName = domain.split('.')[0].replace(/[-_]/g, ' ').toUpperCase();
      evidence.push(`Derived default business name from domain: "${resolvedName}"`);
    } else {
      resolvedName = 'UNKNOWN';
      ambiguityReasons.push('No business name provided and unable to derive from website metadata.');
    }

    // 2. Resolve Geographic Location
    if (inputLocation && inputLocation !== 'UNKNOWN') {
      verifiedLocations.push(inputLocation.trim());
      evidence.push(`Input geographic market provided: "${inputLocation}"`);
    }

    // Check if website title or address mentions location
    if (title) {
      const usStateRegex = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/;
      const match = title.match(usStateRegex);
      if (match && !verifiedLocations.includes(match[0])) {
        verifiedLocations.push(match[0]);
        evidence.push(`Geographic marker detected in page title: "${match[0]}"`);
      }
    }

    // 3. Search Signals Cross-Check
    if (searchResults && searchResults.length > 0) {
      evidence.push(`Cross-referenced ${searchResults.length} public web search results.`);
      
      // Check for conflicting entities
      const distinctNames = new Set<string>();
      for (const res of searchResults) {
        if (res.title) distinctNames.add(res.title);
      }

      if (distinctNames.size > 3 && !domain) {
        ambiguityReasons.push(`Search query returned multiple disparate business entities without a confirmed domain anchor.`);
      }
    }

    // 4. Determine Confidence Status
    let status: IdentityConfidenceStatus = 'CONFIDENT';

    if (ambiguityReasons.length > 0) {
      status = 'AMBIGUOUS';
    } else if (domain && resolvedName && resolvedName !== 'UNKNOWN') {
      // Domain + Resolved Name verified
      status = 'CONFIDENT';
    } else if (resolvedName && resolvedName !== 'UNKNOWN' && verifiedLocations.length > 0) {
      status = 'PROBABLE';
    } else {
      status = 'AMBIGUOUS';
      ambiguityReasons.push('Insufficient authoritative signals to resolve unique business identity.');
    }

    return {
      status,
      resolvedName,
      domain,
      verifiedLocations,
      ambiguityReasons,
      evidence,
    };
  }
}
