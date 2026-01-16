import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Type Definitions
interface Address {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

interface CategoryV2 {
    id: string;
    name: string;
}

interface ListingAttribute {
    id: string;
    categoryAttributeId: string;
    value: string;
    label?: string;
}

interface ListingData {
    id: string;
    secondaryId?: string;
    listingTitle: string;
    listingDescription?: string;
    status: string;
    sellingPrice: number;
    appraisedPrice?: number;
    itemAge?: number;
    itemBrand?: string;
    itemLength?: number;
    itemWidth?: number;
    itemHeight?: number;
    itemWeight?: number;
    deliveryMethod?: string;
    categoryV2?: CategoryV2;
    ListingAttribute?: ListingAttribute[];
    address?: Address;
    createdAt: string;
    updatedAt: string;
}

interface InvoiceDocumentProps {
    data: ListingData;
}

// PDF Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #CC0000',
        paddingBottom: 10,
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#CC0000',
        marginBottom: 5,
    },
    invoiceSubtitle: {
        fontSize: 12,
        color: '#666666',
    },
    section: {
        marginTop: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        borderBottom: '1 solid #CCCCCC',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#555555',
        width: '30%',
    },
    value: {
        fontSize: 10,
        color: '#333333',
        width: '70%',
    },
    description: {
        fontSize: 10,
        color: '#333333',
        lineHeight: 1.5,
        marginTop: 5,
    },
    priceSection: {
        marginTop: 25,
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 12,
        color: '#333333',
    },
    priceValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2 solid #CC0000',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#CC0000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#CC0000',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999999',
        borderTop: '1 solid #CCCCCC',
        paddingTop: 10,
    },
    attributeRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    attributeLabel: {
        fontSize: 9,
        color: '#666666',
        width: '40%',
    },
    attributeValue: {
        fontSize: 9,
        color: '#333333',
        width: '60%',
    },
});

// Helper functions
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Get attribute value by ID
const getAttribute = (
    listingAttributes: ListingAttribute[] | undefined,
    categoryAttributeId: string,
    defaultValue: string = 'N/A'
): string => {
    const attr = listingAttributes?.find(
        (a) => a.categoryAttributeId === categoryAttributeId
    );
    return attr ? attr.value : defaultValue;
};

// Invoice PDF Document Component
const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ data }) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.invoiceTitle}>INVOICE</Text>
                <Text style={styles.invoiceSubtitle}>Fire Apparatus Purchase Order</Text>
            </View>

            {/* Invoice Details */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Invoice Date:</Text>
                    <Text style={styles.value}>{formatDate(new Date())}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Listing ID:</Text>
                    <Text style={styles.value}>{data.secondaryId || data.id}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{data.status}</Text>
                </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>VEHICLE INFORMATION</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Title:</Text>
                    <Text style={styles.value}>{data.listingTitle}</Text>
                </View>
                {data.itemAge && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Year:</Text>
                        <Text style={styles.value}>{data.itemAge}</Text>
                    </View>
                )}
                {data.itemBrand && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Manufacturer:</Text>
                        <Text style={styles.value}>{data.itemBrand}</Text>
                    </View>
                )}
                {data.categoryV2?.name && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Category:</Text>
                        <Text style={styles.value}>{data.categoryV2.name}</Text>
                    </View>
                )}
            </View>

            {/* Specifications */}
            {data.ListingAttribute && data.ListingAttribute.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>

                    {/* Display attributes dynamically */}
                    {data.itemLength && (
                        <View style={styles.attributeRow}>
                            <Text style={styles.attributeLabel}>Dimensions (L×W×H):</Text>
                            <Text style={styles.attributeValue}>
                                {data.itemLength}" × {data.itemWidth}" × {data.itemHeight}"
                            </Text>
                        </View>
                    )}

                    {data.itemWeight && (
                        <View style={styles.attributeRow}>
                            <Text style={styles.attributeLabel}>Weight:</Text>
                            <Text style={styles.attributeValue}>{data.itemWeight.toLocaleString()} lbs</Text>
                        </View>
                    )}

                    {data.deliveryMethod && (
                        <View style={styles.attributeRow}>
                            <Text style={styles.attributeLabel}>Delivery Method:</Text>
                            <Text style={styles.attributeValue}>
                                {data.deliveryMethod.replace(/_/g, ' ')}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Description */}
            {data.listingDescription && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DESCRIPTION</Text>
                    <Text style={styles.description}>
                        {data.listingDescription.substring(0, 800)}
                        {data.listingDescription.length > 800 ? '...' : ''}
                    </Text>
                </View>
            )}

            {/* Pricing */}
            <View style={styles.priceSection}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Listing Price:</Text>
                    <Text style={styles.priceValue}>{formatCurrency(data.sellingPrice)}</Text>
                </View>
                {data.appraisedPrice && (
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Appraised Value:</Text>
                        <Text style={styles.priceValue}>{formatCurrency(data.appraisedPrice)}</Text>
                    </View>
                )}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(data.sellingPrice)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>
                    This invoice is for informational purposes and board approval. Final purchase terms
                    subject to negotiation and contract.
                </Text>
                <Text style={{ marginTop: 5 }}>
                    {data.address?.state && `Location: ${data.address.state} | `}
                    Updated: {formatDate(data.updatedAt)}
                </Text>
            </View>
        </Page>
    </Document>
);

/**
 * Generate a PDF invoice from listing data
 * @param listingData - The fire truck listing data
 * @returns PDF as a Blob
 */
export async function generateInvoicePDF(listingData: ListingData): Promise<Blob> {
    const doc = <InvoiceDocument data={listingData} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    return blob;
}

/**
 * Generate and download a PDF invoice
 * @param listingData - The fire truck listing data
 * @param filename - Optional filename for the download
 */
export async function downloadInvoicePDF(
    listingData: ListingData,
    filename?: string
): Promise<void> {
    const blob = await generateInvoicePDF(listingData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `invoice-${listingData.secondaryId || listingData.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

export default InvoiceDocument;

// Export types for use in other files
export type {
    ListingData,
    Address,
    CategoryV2,
    ListingAttribute,
    InvoiceDocumentProps,
};