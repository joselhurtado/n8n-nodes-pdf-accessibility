import { WCAG_CRITERIA } from '../config';

export class WcagChecker {
	/**
	 * Validates WCAG compliance level
	 */
	static validateComplianceLevel(level: string): 'A' | 'AA' | 'AAA' {
		const validLevels = ['A', 'AA', 'AAA'];
		return validLevels.includes(level.toUpperCase()) ? level.toUpperCase() as 'A' | 'AA' | 'AAA' : 'AA';
	}

	/**
	 * Gets WCAG criteria for a specific level
	 */
	static getCriteriaForLevel(level: 'A' | 'AA' | 'AAA'): string[] {
		const allCriteria = [...WCAG_CRITERIA];
		
		switch (level) {
			case 'A':
				return allCriteria.filter(criteria => 
					criteria.includes('1.1.1') || 
					criteria.includes('2.4.2') || 
					criteria.includes('3.1.1')
				);
			case 'AA':
				return allCriteria;
			case 'AAA':
				return [...allCriteria, '1.4.6 Contrast (Enhanced)', '2.4.9 Link Purpose (Link Only)'];
			default:
				return allCriteria;
		}
	}

	/**
	 * Calculates compliance score based on addressed criteria
	 */
	static calculateComplianceScore(
		addressedCriteria: string[],
		targetLevel: 'A' | 'AA' | 'AAA' = 'AA'
	): number {
		const requiredCriteria = this.getCriteriaForLevel(targetLevel);
		const addressedCount = addressedCriteria.filter(criteria => 
			requiredCriteria.some(required => required.includes(criteria.split(' ')[0]))
		).length;
		
		return Math.round((addressedCount / requiredCriteria.length) * 100);
	}

	/**
	 * Identifies missing criteria for compliance
	 */
	static getMissingCriteria(
		addressedCriteria: string[],
		targetLevel: 'A' | 'AA' | 'AAA' = 'AA'
	): string[] {
		const requiredCriteria = this.getCriteriaForLevel(targetLevel);
		return requiredCriteria.filter(required => 
			!addressedCriteria.some(addressed => addressed.includes(required.split(' ')[0]))
		);
	}

	/**
	 * Validates that criteria format is correct
	 */
	static validateCriteriaFormat(criteria: string[]): string[] {
		const validPattern = /^\d+\.\d+\.\d+\s+.+/;
		return criteria.filter(criterion => validPattern.test(criterion));
	}

	/**
	 * Gets human-readable description for WCAG criteria
	 */
	static getCriteriaDescription(criterion: string): string {
		const descriptions: Record<string, string> = {
			'1.1.1': 'All non-text content must have text alternatives',
			'1.3.1': 'Information and relationships must be programmatically determinable',
			'1.4.3': 'Text must have sufficient color contrast',
			'2.4.2': 'Web pages must have descriptive titles',
			'2.4.4': 'Link purpose must be clear from context',
			'3.1.1': 'Primary language of page must be programmatically determinable',
			'4.1.2': 'For all user interface components, name and role can be programmatically determined',
		};

		const criterionNumber = criterion.split(' ')[0];
		return descriptions[criterionNumber] || 'WCAG accessibility criterion';
	}

	/**
	 * Prioritizes criteria by importance
	 */
	static prioritizeCriteria(criteria: string[]): string[] {
		const priorityOrder = [
			'2.4.2', // Page Titled (easiest to implement)
			'3.1.1', // Language of Page
			'1.1.1', // Non-text Content
			'1.3.1', // Info and Relationships
			'2.4.4', // Link Purpose
			'1.4.3', // Contrast
			'4.1.2', // Name, Role, Value
		];

		return criteria.sort((a, b) => {
			const aNumber = a.split(' ')[0];
			const bNumber = b.split(' ')[0];
			const aIndex = priorityOrder.indexOf(aNumber);
			const bIndex = priorityOrder.indexOf(bNumber);
			
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			
			return aIndex - bIndex;
		});
	}

	/**
	 * Generates compliance report summary
	 */
	static generateComplianceSummary(
		addressedCriteria: string[],
		targetLevel: 'A' | 'AA' | 'AAA' = 'AA'
	): {
		score: number;
		level: string;
		addressed: number;
		total: number;
		missing: string[];
		status: 'compliant' | 'partial' | 'non-compliant';
	} {
		const requiredCriteria = this.getCriteriaForLevel(targetLevel);
		const score = this.calculateComplianceScore(addressedCriteria, targetLevel);
		const missing = this.getMissingCriteria(addressedCriteria, targetLevel);
		
		let status: 'compliant' | 'partial' | 'non-compliant';
		if (score >= 90) status = 'compliant';
		else if (score >= 60) status = 'partial';
		else status = 'non-compliant';

		return {
			score,
			level: targetLevel,
			addressed: addressedCriteria.length,
			total: requiredCriteria.length,
			missing,
			status,
		};
	}
}