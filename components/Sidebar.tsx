
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FunctionCall, useSettings, useUI, useTools } from '@/lib/state';
import c from 'classnames';
import { DEFAULT_LIVE_API_MODEL, AVAILABLE_VOICES } from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { useState, useEffect } from 'react';
import ToolEditorModal from './ToolEditorModal';
import { getPhonebook, saveContact, deleteContact, Contact } from '@/lib/tools/phonebook';

const AVAILABLE_MODELS = [
  DEFAULT_LIVE_API_MODEL
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { systemPrompt, model, voice, setSystemPrompt, setModel, setVoice } =
    useSettings();
  const { tools, toggleTool, addTool, removeTool, updateTool } = useTools();
  const { connected } = useLiveAPIContext();

  const [activeTab, setActiveTab] = useState<'settings' | 'phonebook'>('settings');
  const [editingTool, setEditingTool] = useState<FunctionCall | null>(null);
  
  // Phonebook State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');

  useEffect(() => {
    if (activeTab === 'phonebook') {
        setContacts(getPhonebook());
    }
  }, [activeTab]);

  const handleSaveTool = (updatedTool: FunctionCall) => {
    if (editingTool) {
      updateTool(editingTool.name, updatedTool);
    }
    setEditingTool(null);
  };

  const handleAddContact = () => {
    if (newContactName && newContactNumber) {
        saveContact(newContactName, newContactNumber);
        setContacts(getPhonebook());
        setNewContactName('');
        setNewContactNumber('');
    }
  };

  const handleDeleteContact = (name: string) => {
      deleteContact(name);
      setContacts(getPhonebook());
  };

  const handleImportContacts = async () => {
    // Check if the Contact Picker API is supported
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        // @ts-ignore
        const selectedContacts = await navigator.contacts.select(props, opts);
        
        for (const contact of selectedContacts) {
            const name = contact.name[0];
            const number = contact.tel[0];
            if (name && number) {
                saveContact(name, number);
            }
        }
        setContacts(getPhonebook());
      } catch (ex) {
        console.error('Contact import failed or cancelled', ex);
      }
    } else {
      alert('Contact Import is not supported in this browser.');
    }
  };

  const handleResetDefaults = () => {
     if(window.confirm('Reset System Prompt to default Jerry persona?')) {
        // We trigger a reload to reset state if needed, or just set it manually. 
        // Ideally we grab the constant from state.ts but it's not exported raw.
        // We will just clear storage and reload.
        localStorage.removeItem('jerry-settings-v2');
        window.location.reload();
     }
  }

  return (
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <h3>
             <button 
               className={c('tab-btn', { active: activeTab === 'settings' })} 
               onClick={() => setActiveTab('settings')}
             >
               Settings
             </button>
             <span style={{margin: '0 8px', color: '#444'}}>|</span>
             <button 
               className={c('tab-btn', { active: activeTab === 'phonebook' })} 
               onClick={() => setActiveTab('phonebook')}
             >
               Phonebook
             </button>
          </h3>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        
        {activeTab === 'settings' && (
        <div className="sidebar-content">
          <div className="sidebar-section">
            <fieldset disabled={connected}>
              <label>
                System Prompt
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={10}
                  placeholder="Describe the role and personality of the AI..."
                />
              </label>
              <button 
                onClick={handleResetDefaults} 
                style={{fontSize: '12px', padding: '5px', backgroundColor: '#333', marginTop: '-10px', width: 'fit-content'}}
              >
                Reset to Default Persona
              </button>

              <label>
                Model
                <select value={model} onChange={e => setModel(e.target.value)}>
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voice
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {AVAILABLE_VOICES.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          </div>
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Tools</h4>
            <div className="tools-list">
              {tools.map(tool => (
                <div key={tool.name} className="tool-item">
                  <label className="tool-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id={`tool-checkbox-${tool.name}`}
                      checked={tool.isEnabled}
                      onChange={() => toggleTool(tool.name)}
                      disabled={connected}
                    />
                    <span className="checkbox-visual"></span>
                  </label>
                  <label
                    htmlFor={`tool-checkbox-${tool.name}`}
                    className="tool-name-text"
                  >
                    {tool.name}
                  </label>
                  <div className="tool-actions">
                    <button
                      onClick={() => setEditingTool(tool)}
                      disabled={connected}
                      aria-label={`Edit ${tool.name}`}
                    >
                      <span className="icon">edit</span>
                    </button>
                    <button
                      onClick={() => removeTool(tool.name)}
                      disabled={connected}
                      aria-label={`Delete ${tool.name}`}
                    >
                      <span className="icon">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addTool}
              className="add-tool-button"
              disabled={connected}
            >
              <span className="icon">add</span> Add function call
            </button>
          </div>
        </div>
        )}

        {activeTab === 'phonebook' && (
             <div className="sidebar-content">
                <div className="sidebar-section">
                    <h4 className="sidebar-section-title">My Contacts</h4>
                    <p style={{fontSize: '12px', color: '#888'}}>
                        Sync contacts or add manually so Jerry can call/text them.
                    </p>
                    
                    <button onClick={handleImportContacts} className="add-tool-button">
                        <span className="icon">sync</span> Import from Device
                    </button>

                    <div className="add-contact-form" style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'16px', padding:'10px', background:'#222', borderRadius:'8px'}}>
                        <input 
                            placeholder="Name (e.g. Mama)" 
                            value={newContactName} 
                            onChange={e => setNewContactName(e.target.value)}
                            style={{fontSize: '14px', padding: '8px'}}
                        />
                        <input 
                            placeholder="Number (0917...)" 
                            value={newContactNumber} 
                            onChange={e => setNewContactNumber(e.target.value)}
                            style={{fontSize: '14px', padding: '8px'}}
                        />
                        <button onClick={handleAddContact} style={{background: 'var(--Blue-500)', padding: '8px', borderRadius: '4px'}}>
                            Save Contact
                        </button>
                    </div>

                    <div className="contacts-list" style={{marginTop: '20px', display:'flex', flexDirection: 'column', gap:'8px'}}>
                        {contacts.length === 0 && <span style={{color: '#666', fontStyle:'italic'}}>No contacts saved yet.</span>}
                        {contacts.map((c, i) => (
                            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1a1a', padding:'10px', borderRadius:'6px'}}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'14px'}}>{c.name}</div>
                                    <div style={{fontSize:'12px', color:'#aaa'}}>{c.number}</div>
                                </div>
                                <button onClick={() => handleDeleteContact(c.name)} style={{color: '#ff4600'}}>
                                    <span className="icon">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        )}

      </aside>
      {editingTool && (
        <ToolEditorModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={handleSaveTool}
        />
      )}
    </>
  );
}
