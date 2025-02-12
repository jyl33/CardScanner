import { PSAResponse } from "~/types/psaResponse";
import { NormalizedPSACard } from "@/types/normalizedPSACard";


export const normalizeForDB = (psaResponse: PSAResponse): NormalizedPSACard => {
  return {
    PSACert: {
      brand: psaResponse.PSACert.Brand,
      card_grade: psaResponse.PSACert.CardGrade,
      card_number: psaResponse.PSACert.CardNumber,
      category: psaResponse.PSACert.Category,
      cert_number: psaResponse.PSACert.CertNumber,
      grade_description: psaResponse.PSACert.GradeDescription,
      is_dual_cert: psaResponse.PSACert.IsDualCert,
      is_psa_dna: psaResponse.PSACert.IsPSADNA,
      label_type: psaResponse.PSACert.LabelType,
      population_higher: psaResponse.PSACert.PopulationHigher,
      reverse_bar_code: psaResponse.PSACert.ReverseBarCode,
      spec_id: psaResponse.PSACert.SpecID,
      spec_number: psaResponse.PSACert.SpecNumber,
      subject: psaResponse.PSACert.Subject,
      total_population: psaResponse.PSACert.TotalPopulation,
      total_population_with_qualifier: psaResponse.PSACert.TotalPopulationWithQualifier,
      variety: psaResponse.PSACert.Variety,
      year: psaResponse.PSACert.Year
    }
  };
};