import React, { useState } from 'react';
import { Phone, Video, Users, Plus, ShieldAlert, Heart, Volume2 } from 'lucide-react';
import { Contact, Language } from '../types';
import { playChime } from '../utils/sound';
import { speakText } from '../utils/speech';

interface QuickContactsProps {
  contacts: Contact[];
  onStartCall: (contact: Contact, isVideo: boolean) => void;
  language: Language;
}

export const QuickContacts: React.FC<QuickContactsProps> = ({
  contacts,
  onStartCall,
  language,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-2 border-stone-800 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <Users className="w-7 h-7" />
            <span>{language === 'hi' ? 'परिवार व तुरंत कॉल' : 'Family & Quick Contacts'}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-1">
            {language === 'hi'
              ? 'बड़ी फोटो पर एक स्पर्श करें और तुरंत बात करें।'
              : 'Large photos with simple one-touch voice and video calling.'}
          </p>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => {
          const displayRelationship =
            language === 'hi' ? contact.relationshipHi : contact.relationship;

          return (
            <div
              key={contact.id}
              className={`p-5 rounded-3xl border-3 flex flex-col justify-between transition-all ${
                contact.isEmergency
                  ? 'bg-stone-900 border-amber-500/60 shadow-xl'
                  : 'bg-stone-900 border-stone-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={contact.photoUrl}
                  alt={contact.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md flex-shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-stone-100">
                      {contact.name}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-amber-300 font-semibold">
                    {displayRelationship}
                  </p>

                  <p className="text-xs sm:text-sm font-mono text-stone-400">
                    {contact.phone}
                  </p>

                  {contact.notes && (
                    <p className="text-xs text-stone-400 italic">
                      "{contact.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Large Tap Targets for Voice and Video Call */}
              <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-stone-800">
                <button
                  onClick={() => {
                    playChime();
                    onStartCall(contact, false);
                  }}
                  className="py-3.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>{language === 'hi' ? 'फोन कॉल' : 'Voice Call'}</span>
                </button>

                <button
                  onClick={() => {
                    playChime();
                    onStartCall(contact, true);
                  }}
                  className="py-3.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Video className="w-5 h-5" />
                  <span>{language === 'hi' ? 'वीडियो कॉल' : 'Video Call'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
