import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import {
    doc, onSnapshot, setDoc, collection, addDoc,
    updateDoc, deleteDoc, query, orderBy, getDocs, getDoc, writeBatch
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';
import type { TargetProperty, Comparable, SavedValuation, SurfaceType } from '../types/index';
import { DEFAULT_FACTORS, SURFACE_TYPES } from '../constants';

export const useValuation = () => {
    const { user } = useAuth();

    // State
    const [target, setTarget] = useState<TargetProperty>({
        address: '',
        coveredSurface: 0,
        uncoveredSurface: 0,
        surfaceType: 'Balcón',
        homogenizationFactor: 0.10,
        rooms: 0,
        bedrooms: 0,
        bathrooms: 0,
        age: 0,
        garage: false,
        semiCoveredSurface: 0,
        toilettes: 0,
        floorType: '',
        isCreditEligible: false,
        isProfessional: false,
        hasFinancing: false,
        images: []
    });

    const [comparables, setComparables] = useState<Comparable[]>([]);
    const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([]);

    // Track the currently loaded valuation ID to allow overwriting
    const [currentValuationId, setCurrentValuationId] = useState<string | null>(null);

    const [brokerName, setBrokerName] = useState('Usuario TTasaciones');
    const [matricula, setMatricula] = useState('');
    const [pdfTheme, setPdfTheme] = useState({
        primary: '#4f46e5', // indigo-600
        secondary: '#cbd5e1' // slate-300
    });

    const [migrationDone, setMigrationDone] = useState(false);

    // --- Effects ---

    useEffect(() => {
        if (!user || !db) return;

        // Path definitions
        const basePath = `users/${user.uid}`;
        const targetPath = `${basePath}/data/valuation_active`;
        const comparablesPath = `${basePath}/comparables`;
        const savedPath = `${basePath}/saved_valuations`;

        // Log for debugging sync issues
        console.log("Syncing from base path:", basePath);

        const oldBasePath = `artifacts/tasadorpro/users/${user.uid}`;

        // Migration Logic
        const migrateData = async () => {
            if (migrationDone) return;

            try {
                // Check if new target exists
                const targetRef = doc(db, targetPath);
                const targetSnap = await getDoc(targetRef);

                if (!targetSnap.exists()) {
                    // Try to migrate target
                    const oldTargetRef = doc(db, `${oldBasePath}/data/valuation_active`);
                    const oldTargetSnap = await getDoc(oldTargetRef);
                    if (oldTargetSnap.exists()) {
                        await setDoc(targetRef, oldTargetSnap.data());
                        console.log("Migrated Target Property");
                    }
                }

                // Check comparables
                const comparablesRef = collection(db, comparablesPath);
                const compSnap = await getDocs(comparablesRef);

                if (compSnap.empty) {
                    const oldComparablesRef = collection(db, `${oldBasePath}/comparables`);
                    const oldCompSnap = await getDocs(oldComparablesRef);

                    if (!oldCompSnap.empty) {
                        const batch = writeBatch(db);
                        oldCompSnap.forEach(d => {
                            batch.set(doc(comparablesRef, d.id), d.data());
                        });
                        await batch.commit();
                        console.log(`Migrated ${oldCompSnap.size} comparables`);
                    }
                }

                // Check saved valuations
                const savedRef = collection(db, savedPath);
                const savedSnap = await getDocs(savedRef);

                if (savedSnap.empty) {
                    const oldSavedRef = collection(db, `${oldBasePath}/saved_valuations`);
                    const oldSavedSnap = await getDocs(oldSavedRef);

                    if (!oldSavedSnap.empty) {
                        const batch = writeBatch(db);
                        oldSavedSnap.forEach(d => {
                            batch.set(doc(savedRef, d.id), d.data());
                        });
                        await batch.commit();
                        console.log(`Migrated ${oldSavedSnap.size} saved valuations`);
                    }
                }

                setMigrationDone(true);

            } catch (error) {
                console.error("Migration Error:", error);
            }
        };

        migrateData();

        // Subscriptions
        const targetRef = doc(db, targetPath);
        const comparablesRef = collection(db, comparablesPath);
        const savedRef = collection(db, savedPath);

        // Sync Target
        const unsubTarget = onSnapshot(targetRef, (doc) => {
            if (doc.exists()) {
                setTarget(doc.data() as TargetProperty);
            }
        }, (error) => {
            console.error("Error syncing target:", error);
        });

        // Sync Comparables
        const q = query(comparablesRef, orderBy('daysOnMarket', 'asc')); // Default sort
        const unsubComparables = onSnapshot(q, (snapshot) => {
            const comps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comparable));
            setComparables(comps);
        }, (error) => {
            console.error("Error syncing comparables:", error);
        });

        // Sync Saved Valuations
        const qSaved = query(savedRef, orderBy('date', 'desc'));
        const unsubSaved = onSnapshot(qSaved, (snapshot) => {
            const saved = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavedValuation));
            setSavedValuations(saved);
        }, (error) => {
            console.error("Error syncing saved valuations:", error);
        });

        return () => {
            unsubTarget();
            unsubComparables();
            unsubSaved();
        };
    }, [user, migrationDone]);

    // --- Actions ---

    const addLog = (msg: string) => console.log(`${new Date().toLocaleTimeString()}: ${msg}`);

    const updateTarget = async (updates: Partial<TargetProperty>) => {
        const newTarget = { ...target, ...updates };
        setTarget(newTarget); // Optimistic
        if (user && db) {
            await setDoc(doc(db, `users/${user.uid}/data/valuation_active`), newTarget, { merge: true });
        }
    };

    const addComparable = async () => {
        const newComp: Omit<Comparable, 'id'> = {
            address: 'Nueva Propiedad',
            price: 100000,
            coveredSurface: 50,
            uncoveredSurface: 0,
            surfaceType: 'Ninguno',
            homogenizationFactor: 0,
            daysOnMarket: 0,
            rooms: 0,
            bedrooms: 0,
            bathrooms: 0,
            age: 0,
            garage: false,
            semiCoveredSurface: 0,
            toilettes: 0,
            floorType: '',
            apartmentsInBuilding: 0,
            isCreditEligible: false,
            isProfessional: false,
            hasFinancing: false,
            images: []
        };
        if (user && db) {
            await addDoc(collection(db, `users/${user.uid}/comparables`), newComp);
        } else {
            setComparables([...comparables, { ...newComp, id: Math.random().toString() }]);
        }
    };

    const updateComparable = async (id: string, updates: Partial<Comparable>) => {
        if (user && db) {
            await updateDoc(doc(db, `users/${user.uid}/comparables`, id), updates);
        } else {
            setComparables(comparables.map(c => c.id === id ? { ...c, ...updates } : c));
        }
    };

    const deleteComparable = async (id: string) => {
        if (user && db) {
            await deleteDoc(doc(db, `users/${user.uid}/comparables`, id));
        } else {
            setComparables(comparables.filter(c => c.id !== id));
        }
    };

    const handleNewValuation = async () => {
        if (comparables.length > 0 || target.address) {
            if (!confirm("¿Estás seguro de crear una nueva tasación? Se perderán los datos actuales no guardados.")) return;
        }

        const emptyTarget: TargetProperty = {
            address: '',
            coveredSurface: 0,
            uncoveredSurface: 0,
            surfaceType: 'Balcón',
            homogenizationFactor: 0.10,
            rooms: 0,
            bedrooms: 0,
            bathrooms: 0,
            age: 0,
            garage: false,
            semiCoveredSurface: 0,
            toilettes: 0,
            floorType: '',
            apartmentsInBuilding: 0,
            isCreditEligible: false,
            isProfessional: false,
            hasFinancing: false,
            images: []
        };

        setTarget(emptyTarget);
        setComparables([]);
        setCurrentValuationId(null); // Reset ID

        if (user && db) {
            await setDoc(doc(db, `users/${user.uid}/data/valuation_active`), emptyTarget);
            const compsRef = collection(db, `users/${user.uid}/comparables`);
            const q = query(compsRef);
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);
        }
    };

    const handleSaveValuation = async () => {
        if (!user || !db) {
            alert("Debes estar conectado para guardar.");
            return;
        }

        // Only enforce limit if creating a NEW valuation
        if (!currentValuationId && savedValuations.length >= 30) {
            alert("Has alcanzado el límite de 30 tasaciones guardadas. Elimina alguna para continuar.");
            return;
        }

        if (!target.address) {
            alert("Ingresa una dirección para la propiedad objetivo antes de guardar.");
            return;
        }

        try {
            const valuationName = `${target.address} - ${new Date().toLocaleDateString()}`;
            const valuationData = {
                date: Date.now(),
                target: target,
                comparables: comparables,
                name: valuationName
            };

            if (currentValuationId) {
                // Overwrite existing
                await updateDoc(doc(db, `users/${user.uid}/saved_valuations`, currentValuationId), valuationData);
                alert("Tasación actualizada correctamente.");
            } else {
                // Create new
                const docRef = await addDoc(collection(db, `users/${user.uid}/saved_valuations`), valuationData);
                setCurrentValuationId(docRef.id);
                alert("Tasación guardada correctamente.");
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            alert("Error al guardar tasación: " + error.message);
        }
    };

    const handleDeleteValuation = async (id: string) => {
        if (!user || !db) return;
        if (!confirm("¿Estás seguro de eliminar esta tasación?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/saved_valuations`, id));
            // If we deleted the one currently open, reset the ID to avoid phantom updates
            if (id === currentValuationId) {
                setCurrentValuationId(null);
            }
        } catch (error: any) {
            console.error("Delete Error:", error);
            alert("Error al eliminar.");
        }
    };

    const handleLoadValuation = async (valuation: SavedValuation) => {
        if (!confirm("Cargar esta tasación reemplazará los datos actuales. ¿Continuar?")) return;
        try {
            setTarget(valuation.target);
            setComparables(valuation.comparables);
            setCurrentValuationId(valuation.id); // Set the current ID

            if (user && db) {
                await setDoc(doc(db, `users/${user.uid}/data/valuation_active`), valuation.target, { merge: true });
                const compsRef = collection(db, `users/${user.uid}/comparables`);
                const snapshot = await getDocs(query(compsRef));
                await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
                await Promise.all(valuation.comparables.map(c => addDoc(compsRef, c)));
            }
        } catch (error: any) {
            console.error("Load Error:", error);
            alert("Error al cargar tasación.");
        }
    };

    // --- Google Sheets Integration ---

    const [sheetUrl, setSheetUrl] = useState('');

    const getSheetCsvUrl = (url: string) => {
        try {
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv`;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const handleImportFromSheet = async () => {
        if (!sheetUrl) {
            alert("Por favor ingresa el link de tu Google Sheet (debe ser público).");
            return;
        }

        const csvUrl = getSheetCsvUrl(sheetUrl);
        if (!csvUrl) {
            alert("Link inválido. Asegúrate de copiar el link completo de tu Google Sheet.");
            return;
        }

        try {
            addLog("Fetching data from Google Sheet...");
            const urlWithCacheBuster = `${csvUrl}&t=${Date.now()}`;
            const response = await fetch(urlWithCacheBuster);
            if (!response.ok) throw new Error("Failed to fetch sheet");
            const text = await response.text();

            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h: string) => h.trim(),
                complete: async (results: any) => {
                    try {
                        const rows = results.data as any[];
                        const newComps: Omit<Comparable, 'id'>[] = [];

                        const cleanNumber = (val: any): number => {
                            if (!val) return 0;
                            let str = val.toString();
                            str = str.replace(/[Uu$sSDdm²\s]/g, '');
                            str = str.replace(/\./g, '').replace(',', '.');
                            return parseFloat(str) || 0;
                        };

                        for (const row of rows) {
                            const address = row['Dirección'] || row['Address'] || 'Sin dirección';
                            if ((!address || address === 'Sin dirección') && !row['Precio']) continue;

                            const price = cleanNumber(row['Precio'] || row['Price']);
                            const covered = cleanNumber(row['Sup. Cubierta'] || row['Covered Surface']);
                            const uncovered = cleanNumber(row['Sup. Descubierta'] || row['Uncovered Surface']);

                            const typeRaw = (row['Tipo Sup'] || row['Surface Type'] || '').trim();
                            const type = SURFACE_TYPES.includes(typeRaw as any) ? (typeRaw as SurfaceType) : 'Ninguno';

                            const factorRaw = row['Factor'] ? cleanNumber(row['Factor']) : NaN;
                            const factor = (factorRaw > 0) ? factorRaw : DEFAULT_FACTORS[type] || 1;

                            const days = cleanNumber(row['Días'] || row['Days']);

                            newComps.push({
                                address,
                                price,
                                coveredSurface: covered,
                                uncoveredSurface: uncovered,
                                surfaceType: type,
                                homogenizationFactor: factor,
                                daysOnMarket: days
                            });
                        }

                        if (user && db) {
                            await Promise.all(newComps.map(c => addDoc(collection(db, `users/${user.uid}/comparables`), c)));
                        } else {
                            setComparables(prev => [...prev, ...newComps.map(c => ({ ...c, id: Math.random().toString() }))]);
                        }

                        addLog(`Successfully imported ${newComps.length} rows from Sheet`);
                    } catch (err: any) {
                        console.error("Parse Logic Error:", err);
                        alert(`Error processing data: ${err.message}`);
                    }
                },
                error: (err: any) => {
                    console.error("CSV Parse Error:", err);
                    alert("Error parsing Sheet data.");
                }
            });
        } catch (error: any) {
            console.error("Sheet Import Error:", error);
            alert("Error importando desde Sheet. Asegúrate que esté configurada como 'Cualquiera con el enlace puede ver'.");
        }
    };

    // --- Calculations ---

    const calculateHomogenizedSurface = (covered: number, uncovered: number, factor: number) => {
        return covered + (uncovered * factor);
    };

    const calculateHomogenizedPrice = (price: number, hSurface: number) => {
        if (hSurface === 0) return 0;
        return price / hSurface;
    };

    const targetHomogenizedSurface = calculateHomogenizedSurface(target.coveredSurface, target.uncoveredSurface, target.homogenizationFactor);

    const processedComparables = useMemo(() => {
        return comparables.map(c => {
            const hSurface = calculateHomogenizedSurface(c.coveredSurface, c.uncoveredSurface, c.homogenizationFactor);
            const hPrice = calculateHomogenizedPrice(c.price, hSurface);
            return { ...c, hSurface, hPrice };
        }).filter(c => c.hPrice > 0);
    }, [comparables]);

    const stats = useMemo(() => {
        if (processedComparables.length === 0) return { avg: 0, min: 0, max: 0, terciles: [0, 0, 0] };
        const prices = processedComparables.map(c => c.hPrice).sort((a, b) => a - b);
        const sum = prices.reduce((a, b) => a + b, 0);
        const avg = sum / prices.length;
        const min = prices[0];
        const max = prices[prices.length - 1];
        const t1 = prices[Math.floor(prices.length / 3)];
        const t2 = prices[Math.floor(2 * prices.length / 3)];
        return { avg, min, max, terciles: [t1, avg, t2] };
    }, [processedComparables]);

    const valuation = useMemo(() => {
        if (!targetHomogenizedSurface) return { low: 0, market: 0, high: 0 };
        return {
            low: stats.terciles[0] * targetHomogenizedSurface,
            market: stats.avg * targetHomogenizedSurface,
            high: stats.terciles[2] * targetHomogenizedSurface
        };
    }, [stats, targetHomogenizedSurface]);

    return {
        target, setTarget, updateTarget,
        comparables, setComparables, addComparable, updateComparable, deleteComparable, processedComparables,
        savedValuations, handleNewValuation, handleSaveValuation, handleDeleteValuation, handleLoadValuation,
        sheetUrl, setSheetUrl, handleImportFromSheet,
        brokerName, setBrokerName,
        matricula, setMatricula,
        pdfTheme, setPdfTheme,
        stats, valuation, targetHomogenizedSurface
    };
};
