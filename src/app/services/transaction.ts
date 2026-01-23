import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, map, Observable, of } from 'rxjs';
import { VERSEMENT_MUTATION } from '../graphql/mutations';
import {
  GET_PAGED_TRANSACTIONS,
  GET_RELEVE,
  GET_RELEVE_PDF_BASE64,
  GET_TRANSACTIONS,
  SEND_RELEVE_BY_EMAIL
} from '../graphql/queries';

/**
 * TransactionType enum (réutilise la même chaîne que le backend)
 */
export enum TransactionType {
  DEPOT = 'DEPOT',
  RETRAIT = 'RETRAIT',
  VIREMENT = 'VIREMENT',
  PAIEMENT = 'PAIEMENT',
  REMBOURSEMENT = 'REMBOURSEMENT'
}

export interface CompteMini {
  id?: string;
  numero?: string;
  proprietaire?: {
    id?: string;
    nom?: string;
    prenom?: string;
    identifiant?: string;
    email?: string;
  };
}

export interface TransactionResult {
  id: string;
  montant: number;
  dateCreation?: string;
  dateUpdate?: string;
  transactionType?: TransactionType; // <- now typed
  compteSource?: CompteMini;
  compteDestination?: CompteMini;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apollo = inject(Apollo);

  // --- Mutations (versement / retrait / virement) ---

  depot(compteDestinationId: string, montant: number): Observable<TransactionResult> {
    return this.apollo
      .mutate<{ versement: TransactionResult }>({
        mutation: VERSEMENT_MUTATION,
        variables: {
          input: {
            montant,
            compte_destination_Id: compteDestinationId,
            transactionType: TransactionType.DEPOT
          }
        }
      })
      .pipe(
        map(result => {
          if (!result.data?.versement) {
            throw new Error('Erreur lors du dépôt');
          }
          return result.data.versement;
        })
      );
  }

  retrait(compteSourceId: string, montant: number): Observable<TransactionResult> {
    return this.apollo
      .mutate<{ versement: TransactionResult }>({
        mutation: VERSEMENT_MUTATION,
        variables: {
          input: {
            montant,
            compte_source_Id: compteSourceId,
            transactionType: TransactionType.RETRAIT
          }
        }
      })
      .pipe(
        map(result => {
          if (!result.data?.versement) {
            throw new Error('Erreur lors du retrait');
          }
          return result.data.versement;
        })
      );
  }

  virement(
    compteSourceId: string,
    compteDestinationId: string,
    montant: number
  ): Observable<TransactionResult> {
    return this.apollo
      .mutate<{ versement: TransactionResult }>({
        mutation: VERSEMENT_MUTATION,
        variables: {
          input: {
            montant,
            compte_source_Id: compteSourceId,
            compte_destination_Id: compteDestinationId,
            transactionType: TransactionType.VIREMENT
          }
        }
      })
      .pipe(
        map(result => {
          if (!result.data?.versement) {
            throw new Error('Erreur lors du virement');
          }
          return result.data.versement;
        })
      );
  }

  // --- Queries ---

  /**
   * Récupère les transactions paginées (GET_PAGED_TRANSACTIONS)
   * Renvoie un tableau typé TransactionResult[]
   */
  getPagedTransactions(page = 0, size = 10): Observable<TransactionResult[]> {
    console.debug('TransactionService.getPagedTransactions called', { page, size });
    return this.apollo.query<{ transactions: TransactionResult[] }>({
      query: GET_PAGED_TRANSACTIONS,
      variables: { page, size },
      fetchPolicy: 'network-only'
    }).pipe(
      map(r => {
        const txs = r?.data?.transactions ?? [];
        console.debug('TransactionService.getPagedTransactions result:', txs);
        return Array.isArray(txs) ? txs : [];
      }),
      catchError(err => {
        console.error('TransactionService.getPagedTransactions error:', err);
        return of([] as TransactionResult[]);
      })
    );
  }

  /**
   * Récupère les transactions pour un compte et une période.
   * Typé également en TransactionResult[].
   */
  getTransactionsByAccountId(compteId: string, startDate?: string, endDate?: string): Observable<TransactionResult[]> {
    return this.apollo.query<{ getTransactions: TransactionResult[] }>({
      query: GET_TRANSACTIONS,
      fetchPolicy: 'network-only',
      variables: {
        compteId,
        startDate: startDate ?? null,
        endDate: endDate ?? null
      }
    }).pipe(
      map(result => {
        const txs = result?.data?.getTransactions ?? [];
        return Array.isArray(txs) ? txs : [];
      }),
      catchError(err => {
        console.error('GraphQL getTransactions error', err);
        return of([] as TransactionResult[]);
      })
    );
  }

  getReleve(compteId: string, startDate: string, endDate: string): Observable<any> {
    return this.apollo.query<any>({
      query: GET_RELEVE,
      variables: { compteId, startDate, endDate },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data.getReleve));
  }

  downloadRelevePdf(compteId: string, startDate: string, endDate: string): Observable<void> {
    return this.apollo.query<{ getRelevePdfBase64: string }>({
      query: GET_RELEVE_PDF_BASE64,
      variables: { compteId, startDate, endDate },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        const base64Data = result.data?.getRelevePdfBase64 ?? '';
        if (!base64Data) {
          throw new Error('Aucun PDF retourné par le serveur');
        }
        this.convertBase64ToPdfAndDownload(base64Data, `releve_${compteId}.pdf`);
      }),
      catchError(err => {
        console.error('downloadRelevePdf error', err);
        return of(undefined);
      })
    );
  }

  sendReleveByEmail(compteId: string, startDate: string, endDate: string, customEmail?: string): Observable<string> {
    return this.apollo.mutate<{ sendReleveByEmail: string }>({
      mutation: SEND_RELEVE_BY_EMAIL,
      variables: { compteId, startDate, endDate, customEmail }
    }).pipe(
      map(result => result.data?.sendReleveByEmail ?? ''),
      catchError(err => {
        console.error('sendReleveByEmail error', err);
        return of('');
      })
    );
  }

  // helper pour download base64 -> pdf
  private convertBase64ToPdfAndDownload(base64String: string, fileName: string) {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
