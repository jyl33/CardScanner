export interface NormalizedPSACard {
    PSACert: {
      id? : string;
      brand: string;
      card_grade: string;
      card_number: string;
      category: string;
      cert_number: string;
      grade_description: string;
      is_dual_cert: boolean;
      is_psa_dna: boolean;
      label_type: string;
      population_higher: number;
      reverse_bar_code: boolean;
      spec_id: number;
      spec_number: string;
      subject: string;
      total_population: number;
      total_population_with_qualifier: number;
      variety: string;
      year: string;
    }
  }