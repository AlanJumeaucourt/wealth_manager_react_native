import { Category } from '@/types/category';

export const budgetExpensesCategories: Category[] = [
    {
      name: "Abonnements",
      subCategories: [
        { name: "Abonnements - Autres" },
        { name: "Câble / Satellite" },
        { name: "Internet" },
        { name: "Téléphone fixe" },
        { name: "Téléphonie mobile" }
      ]
    },
    {
      name: "Achats & Shopping",
      subCategories: [
        { name: "Achats & Shopping - Autres" },
        { name: "Articles de sport" },
        { name: "Cadeaux" },
        { name: "Films & DVDs" },
        { name: "High Tech" },
        { name: "Licences" },
        { name: "Livres" },
        { name: "Musique" },
        { name: "Vêtements/Chaussures" }
      ]
    },
    {
      name: "Alimentation & Restauration",
      subCategories: [
        { name: "Alimentation & Restauration - Autres" },
        { name: "Café" },
        { name: "Fast foods" },
        { name: "Restaurants" },
        { name: "Supermarché / Epicerie" }
      ]
    },
    {
      name: "Auto & Transports",
      subCategories: [
        { name: "Auto & Transports - Autres" },
        { name: "Assurance véhicule" },
        { name: "Billets d'avion" },
        { name: "Billets de train" },
        { name: "Carburant" },
        { name: "Entretien véhicule" },
        { name: "Location de véhicule" },
        { name: "Péage" },
        { name: "Stationnement" },
        { name: "Transports en commun" },
      ]
    },
    {
      name: "Banque",
      subCategories: [
        { name: "Banque - Autres" },
        { name: "Débit mensuel carte" },
        { name: "Epargne" },
        { name: "Frais bancaires" },
        { name: "Hypothèque" },
        { name: "Incidents de paiement" },
        { name: "Remboursement emprunt" },
        { name: "Services Bancaires" },
      ]
    },
    {
      name: "Dépenses pro",
      subCategories: [
        { name: "Comptabilité" },
        { name: "Conseils" },
        { name: "Cotisations Sociales" },
        { name: "Dépenses pro - Autres" },
        { name: "Fournitures de bureau" },
        { name: "Frais d'expéditions" },
        { name: "Frais d'impressions" },
        { name: "Frais de recrutement" },
        { name: "Frais juridique" },
        { name: "Maintenance bureaux" },
        { name: "Marketing" },
        { name: "Notes de frais" },
        { name: "Prévoyance" },
        { name: "Publicité" },
        { name: "Rémunérations dirigeants" },
        { name: "Salaires" },
        { name: "Services en ligne" },
        { name: "Sous-traitance" },
        { name: "Taxe d'apprentissage" },
      ],
    },
    {
      name: "Divers",
      subCategories: [
        { name: "A catégoriser" },
        { name: "Assurance" },
        { name: "Autres dépenses" },
        { name: "Dons" },
        { name: "Pressing" },
        { name: "Tabac" },
      ],
    },
    {
      name: "Esthétique & Soins",
      subCategories: [
        { name: "Coiffeur" },
        { name: "Cosmétique" },
        { name: "Esthétique" },
        { name: "Esthétique & Soins - Autres" },
        { name: "Spa & Massage" },
      ],
    },
    {
      name: "Impôts & Taxes",
      subCategories: [
        { name: "Amendes" },
        { name: "Impôts & Taxes - Autres" },
        { name: "Impôts fonciers" },
        { name: "Impôts sur le revenu" },
        { name: "Taxes" },
        { name: "TVA" },
      ],
    },
    {
      name: "Logement",
      subCategories: [
        { name: "Assurance habitation" },
        { name: "Charges diverses" },
        { name: "Décoration" },
        { name: "Eau" },
        { name: "Electricité" },
        { name: "Entretien" },
        { name: "Extérieur et jardin" },
        { name: "Gaz" },
        { name: "Logement - Autres" },
        { name: "Loyer" },
      ],
    },
    {
      name: "Loisirs & Sorties",
      subCategories: [
        { name: "Bars / Clubs" },
        { name: "Divertissements" },
        { name: "Frais Animaux" },
        { name: "Hobbies" },
        { name: "Hôtels" },
        { name: "Loisirs & Sorties - Autres" },
        { name: "Sortie au restaurant" },
        { name: "Sorties culturelles" },
        { name: "Sport" },
        { name: "Sports d'hiver" },
        { name: "Voyages / Vacances" },
      ],
    },
    {
      name: "Retraits, Chq. et Vir.",
      subCategories: [
        { name: "Chèques" },
        { name: "Retraits" },
        { name: "Virements" },  
        { name: "Virements internes" },
      ],
    },
    {
      name: "Santé",
      subCategories: [
        { name: "Dentiste" },
        { name: "Médecin" },
        { name: "Mutuelle" },
        { name: "Opticien / Ophtalmo." },
        { name: "Pharmacie" },
        { name: "Santé - Autres" },
      ],
    },
    {
      name: "Scolarité & Enfants",
      subCategories: [
        { name: "Baby-sitters & Crèches" },
        { name: "Ecole" },
        { name: "Fournitures scolaires" },
        { name: "Jouets" },
        { name: "Logement étudiant" },
        { name: "Pensions" },
        { name: "Prêt étudiant" },
        { name: "Scolarité & Enfants - Autres" },
      ],
    },
  ];
  
export const budgetIncomesCategories: Category[] = [
    {name: "Allocations et pensions"},
    {name: "Autres rentrées"},
    {name: "Dépôt d'argent"},
    {name: "Economies"},
    {name: "Emprunt"},
    {name: "Extra"},
    {name: "Intérêts"},
    {name: "Loyers reçus"},
    {name: "Remboursements"},
    {name: "Retraite"},
    {name: "Salaires"},
    {name: "Services"},
    {name: "Subventions"},
    {name: "Ventes"},
    {name: "Virements internes"},
  ];