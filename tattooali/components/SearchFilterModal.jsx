import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import bairrosData from '../data/bairros_fortaleza.json';
import { colors } from '../theme';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBox: {
    minHeight: '50%',
    backgroundColor: colors.surface,
    borderWidth: 0,
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.text2,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  filterChoices: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  filterButtons: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface2,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 16,
    paddingVertical: 14,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const SearchFilterModal = ({ visible, onClose, onApply, onReset }) => {
  const [activeTab, setActiveTab] = useState('localizacao');
  const [bairroInput, setBairroInput] = useState('');
  const [bairroDropdownOpen, setBairroDropdownOpen] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState(null);
  const [filteredBairros, setFilteredBairros] = useState(bairrosData);
  const [selectedStars, setSelectedStars] = useState(null);

  useEffect(() => {
    if (bairroInput.trim() === '') {
      setFilteredBairros(bairrosData);
    } else {
      setFilteredBairros(
        bairrosData.filter(b => b.toLowerCase().includes(bairroInput.toLowerCase()))
      );
    }
  }, [bairroInput]);

  const handleApply = () => {
    const filters = {
      bairro: selectedBairro,
      estrelas: selectedStars,
    };
    if (onApply) onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedBairro(null);
    setSelectedStars(null);
    setBairroInput('');
    setBairroDropdownOpen(false);
    if (onReset) onReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.dragIndicator} />
          <Text style={styles.modalTitle}>Filtrar por</Text>
          <View style={styles.filterChoices}>
            <TouchableOpacity
              style={[styles.filterButtons, activeTab === 'localizacao' && { backgroundColor: '#222', borderColor: '#fbbf24', borderWidth: 1 }]}
              onPress={() => setActiveTab('localizacao')}
            >
              <Text style={[styles.modalSubtitle, activeTab === 'localizacao' && { color: '#fff', fontWeight: 'bold' }]}>Localização</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButtons, activeTab === 'avaliacao' && { backgroundColor: '#222', borderColor: '#fbbf24', borderWidth: 1 }]}
              onPress={() => setActiveTab('avaliacao')}
            >
              <Text style={[styles.modalSubtitle, activeTab === 'avaliacao' && { color: '#fff', fontWeight: 'bold' }]}>Avaliações</Text>
            </TouchableOpacity>
          </View>

          {/* Filtro por Localização */}
          {activeTab === 'localizacao' && (
            <View style={{ width: '100%' }}>
              <Text style={styles.modalSubtitle}>Bairro</Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#333',
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: '#181818',
                  marginBottom: 8,
                }}
                onPress={() => setBairroDropdownOpen(!bairroDropdownOpen)}
              >
                <Text style={{ color: selectedBairro ? '#fff' : '#888' }}>
                  {selectedBairro || 'Selecione um bairro'}
                </Text>
              </TouchableOpacity>
              {bairroDropdownOpen && (
                <View style={{
                  maxHeight: 200,
                  borderWidth: 1,
                  borderColor: '#333',
                  borderRadius: 10,
                  backgroundColor: '#222',
                  marginBottom: 8,
                }}>
                  <TextInput
                    style={{
                      padding: 10,
                      color: '#fff',
                      backgroundColor: '#181818',
                      borderBottomWidth: 1,
                      borderBottomColor: '#333',
                    }}
                    placeholder="Buscar bairro..."
                    placeholderTextColor="#888"
                    value={bairroInput}
                    onChangeText={setBairroInput}
                    autoFocus
                  />
                  <ScrollView style={{ maxHeight: 150 }}>
                    {filteredBairros.length === 0 && (
                      <Text style={{ color: '#888', padding: 10 }}>Nenhum bairro encontrado</Text>
                    )}
                    {filteredBairros.map(bairro => (
                      <TouchableOpacity
                        key={bairro}
                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' }}
                        onPress={() => {
                          setSelectedBairro(bairro);
                          setBairroDropdownOpen(false);
                          setBairroInput('');
                        }}
                      >
                        <Text style={{ color: '#fff' }}>{bairro}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Filtro por Avaliação */}
          {activeTab === 'avaliacao' && (
            <View style={{ width: '100%' }}>
              <Text style={styles.modalSubtitle}>Avaliação mínima</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
                {[1,2,3,4,5].map(star => (
                  <TouchableOpacity
                    key={star}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: selectedStars === star ? '#fbbf24' : '#181818',
                      borderWidth: 1,
                      borderColor: selectedStars === star ? '#fbbf24' : '#333',
                      marginRight: 6,
                    }}
                    onPress={() => setSelectedStars(star)}
                  >
                    <Text style={{ color: selectedStars === star ? '#222' : '#fff', fontWeight: 'bold' }}>{'★'.repeat(star)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={[styles.buttonText, { color: '#222' }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={[styles.buttonText, { color: '#fff' }]}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SearchFilterModal;