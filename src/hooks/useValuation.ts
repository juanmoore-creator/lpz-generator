import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import {
    doc, onSnapshot, setDoc, collection, addDoc,
    updateDoc, deleteDoc, query, orderBy, getDocs, writeBatch
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
    const [currentValuationId, setCurrentValuationId] = useState<string | null>(null);

    const [brokerName, setBrokerName] = useState('Usuario TTasaciones');
    const [matricula, setMatricula] = useState('');
    const [pdfTheme, setPdfTheme] = useState({
        primary: '#4f46e5', // indigo-600
        secondary: '#cbd5e1' // slate-300
    });



    // --- Helpers ---

    // Helper to get formatted paths and ensure user exists
    const getPaths = () => {
        if (!user || !user.uid) {
            console.warn("Attempted to get paths with no user");
            return null;
        }
        return {
            basePath: `users/${user.uid}`,
            targetPath: `users/${user.uid}/data/valuation_active`,
            comparablesPath: `users/${user.uid}/comparables`,
            savedPath: `users/${user.uid}/saved_valuations`,
            oldBasePath: `artifacts/tasadorpro/users/${user.uid}`
        };
    };

    // --- Effects ---

    useEffect(() => {
        if (!user?.uid || !db) return;

        const paths = getPaths();
        if (!paths) return;

        const { targetPath, comparablesPath, savedPath } = paths;

        // Logging paths for debugging
        console.log("Setting up listeners with paths:", { targetPath, comparablesPath, savedPath });

        // Subscriptions
        const targetRef = doc(db, targetPath);
        const comparablesRef = collection(db, comparablesPath);
        const savedRef = collection(db, savedPath);

        const unsubTarget = onSnapshot(targetRef, (doc) => {
            if (doc.exists()) {
                setTarget(doc.data() as TargetProperty);
            }
        }, (error) => {
            console.error("Error syncing target:", error);
        });

        const q = query(comparablesRef, orderBy('daysOnMarket', 'asc'));
        const unsubComparables = onSnapshot(q, (snapshot) => {
            const comps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comparable));
            setComparables(comps);
        }, (error) => {
            console.error("Error syncing comparables:", error);
        });

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
    }, [user]);

    // --- Actions ---

    const addLog = (msg: string) => console.log(`${new Date().toLocaleTimeString()}: ${msg}`);

    const updateTarget = async (updates: Partial<TargetProperty>) => {
        const newTarget = { ...target, ...updates };
        setTarget(newTarget); // Optimistic

        const paths = getPaths();
        if (!paths) return;

        if (user && db) {
            console.log("Updating target at:", paths.targetPath);
            await setDoc(doc(db, paths.targetPath), newTarget, { merge: true });
        }
    };

    const addComparable = async () => {
        const paths = getPaths();
        if (!paths) return; // Strict check

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
            console.log("Adding comparable to:", paths.comparablesPath);
            await addDoc(collection(db, paths.comparablesPath), newComp);
        } else {
            setComparables([...comparables, { ...newComp, id: Math.random().toString() }]);
        }
    };

    const updateComparable = async (id: string, updates: Partial<Comparable>) => {
        const paths = getPaths();
        if (user && db && paths) {
            const compPath = `${paths.comparablesPath}/${id}`;
            console.log("Updating comparable at:", compPath);
            await updateDoc(doc(db, compPath), updates);
        } else {
            setComparables(comparables.map(c => c.id === id ? { ...c, ...updates } : c));
        }
    };

    const deleteComparable = async (id: string) => {
        const paths = getPaths();
        if (user && db && paths) {
            const compPath = `${paths.comparablesPath}/${id}`;
            console.log("Deleting comparable at:", compPath);
            await deleteDoc(doc(db, compPath));
        } else {
            setComparables(comparables.filter(c => c.id !== id));
        }
    };

    const handleNewValuation = async () => {
        if (comparables.length > 0 || target.address) {
            if (!confirm("¿Estás seguro de crear una nueva tasación? Se perderán los datos actuales no guardados.")) return;
        }

        const paths = getPaths();
        if (!paths) return;

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
        setCurrentValuationId(null);

        if (user && db) {
            console.log("Starting new valuation reset");
            const batch = writeBatch(db);

            // 1. Reset Target
            const targetRef = doc(db, paths.targetPath);
            batch.set(targetRef, emptyTarget);

            // 2. Clear Comparables
            const compsRef = collection(db, paths.comparablesPath);
            const q = query(compsRef);
            // Must fetch to get IDs
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(d => {
                batch.delete(d.ref);
            });

            await batch.commit();
            console.log("New valuation reset committed");
        }
    };

    const handleSaveValuation = async () => {
        if (!user || !db) {
            window.alert("Debes estar conectado para guardar.");
            return;
        }

        const paths = getPaths();
        if (!paths) {
            window.alert("Error: Usuario no identificado correctamente.");
            return;
        }

        // LIMIT CHECK
        if (!currentValuationId && savedValuations.length >= 30) {
            window.alert("Has alcanzado el límite de 30 tasaciones guardadas.");
            return;
        }

        // PROPER VALIDATION
        if (!target.address || target.address.trim() === '') {
            window.alert("Ingresa una dirección válida para la propiedad antes de guardar.");
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
                // UPDATE / OVERWRITE LOGIC
                // STRICT REQUIREMENT: Use setDoc with merge: true
                const docRef = doc(db, paths.savedPath, currentValuationId);
                console.log("Saving (Overwrite) to:", docRef.path);

                await setDoc(docRef, valuationData, { merge: true });
                console.log('ESCRITURA COMPLETADA EN:', docRef.path);

                window.alert("Tasación actualizada correctamente.");
            } else {
                // NEW CREATE LOGIC
                // STRICT REQUIREMENT: Use setDoc even for new docs to ensure creation
                // We generate a new ID first
                const newDocRef = doc(collection(db, paths.savedPath));
                console.log("Saving (New) to:", newDocRef.path);

                await setDoc(newDocRef, valuationData, { merge: true });
                console.log('ESCRITURA COMPLETADA EN:', newDocRef.path);

                setCurrentValuationId(newDocRef.id);
                window.alert("Tasación guardada correctamente.");
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            window.alert("Error al guardar: " + (error?.message || error));
        }
    };

    const handleDeleteValuation = async (id: string) => {
        const paths = getPaths();
        if (!user || !db || !paths) return;

        if (!confirm("¿Estás seguro de eliminar esta tasación?")) return;
        try {
            const docPath = `${paths.savedPath}/${id}`;
            console.log("Deleting valuation at:", docPath);
            await deleteDoc(doc(db, docPath));

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

        const paths = getPaths();
        if (!paths) return;

        try {
            setTarget(valuation.target);
            setComparables(valuation.comparables);
            setCurrentValuationId(valuation.id);

            if (user && db) {
                console.log("Loading valuation, batch update started");
                const batch = writeBatch(db);

                // 1. Update Target
                const targetRef = doc(db, paths.targetPath);
                batch.set(targetRef, valuation.target, { merge: true });

                // 2. Clear Existing Comparables
                const compsRef = collection(db, paths.comparablesPath);
                const snapshot = await getDocs(query(compsRef));
                snapshot.docs.forEach(d => batch.delete(d.ref));

                // 3. Add New Comparables
                valuation.comparables.forEach(c => {
                    const newRef = doc(compsRef); // Generate ID
                    batch.set(newRef, c);
                });

                await batch.commit();
                console.log("Valuation loaded successfully");
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

        const paths = getPaths();

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

                        if (user && db && paths) {
                            console.log("Importing batch to:", paths.comparablesPath);
                            const batch = writeBatch(db);
                            newComps.forEach(c => {
                                const newRef = doc(collection(db, paths.comparablesPath));
                                batch.set(newRef, c);
                            });
                            await batch.commit();
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
